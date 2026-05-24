import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import type { ReleaseKind } from "@/lib/supabase/database.types";

export const runtime = "nodejs";
// 250MB upload ceiling on this route. Next defaults vary but route handlers do
// not impose the 1MB server-action limit; the upstream cap (Vercel etc) applies.
// We also re-check size at the application layer below.
export const maxDuration = 300;

const VALID_KINDS: ReleaseKind[] = ["release", "hotfix", "patch"];
const MAX_FILE_BYTES = 200 * 1024 * 1024; // 200MB

function asJson(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return asJson("Sign in first.", 401);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: import("@/lib/supabase/database.types").Role }>();
  if (!profile || !isStaff(profile.role)) {
    return asJson("Only staff can publish releases.", 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return asJson("Invalid multipart payload.", 400);
  }

  const version = String(form.get("version") ?? "").trim();
  const kind = String(form.get("kind") ?? "release") as ReleaseKind;
  const releasedAt =
    String(form.get("released_at") ?? "").trim() ||
    new Date().toISOString().slice(0, 10);
  const notesRaw = String(form.get("notes") ?? "").trim();
  const checksum = String(form.get("checksum") ?? "").trim() || null;
  const published = form.get("published") === "on";
  const file = form.get("file") as File | null;
  const externalUrl = String(form.get("download_url") ?? "").trim() || null;

  if (!version) return asJson("Version is required (e.g. v3.9.0).", 400);
  if (version.length > 64) return asJson("Version is too long.", 400);
  if (!VALID_KINDS.includes(kind)) return asJson("Invalid kind.", 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(releasedAt)) {
    return asJson("Released date must be YYYY-MM-DD.", 400);
  }

  const notes = notesRaw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  let downloadUrl: string | null = externalUrl;
  if (file && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) {
      return asJson("File is over the 200MB limit.", 413);
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
    const path = `${version.replace(/[^A-Za-z0-9._-]+/g, "_")}/${Date.now()}_${safeName}`;

    const { error: upErr } = await supabase.storage
      .from("releases")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });
    if (upErr) return asJson(`Upload failed: ${upErr.message}`, 500);

    const { data: pub } = supabase.storage.from("releases").getPublicUrl(path);
    downloadUrl = pub.publicUrl;
  }

  const { error } = await supabase.from("releases").insert({
    version,
    kind,
    released_at: releasedAt,
    notes,
    download_url: downloadUrl,
    checksum,
    published,
    created_by: user.id,
  });

  if (error) {
    return asJson(`Could not save release: ${error.message}`, 500);
  }

  revalidatePath("/admin/releases");
  revalidatePath("/changelog");
  revalidatePath("/downloads");

  return NextResponse.json({
    ok: true,
    message: published
      ? `Published ${version}.`
      : `Saved draft ${version}.`,
  });
}
