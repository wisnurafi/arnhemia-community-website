"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { isStaff } from "@/lib/roles";

export async function togglePublishedAction(formData: FormData) {
  const session = await getSession();
  if (!session || !isStaff(session.profile.role)) return;

  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "1";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("releases").update({ published }).eq("id", id);

  revalidatePath("/admin/releases");
  revalidatePath("/changelog");
  revalidatePath("/downloads");
}

export async function deleteReleaseAction(formData: FormData) {
  const session = await getSession();
  if (!session || !isStaff(session.profile.role)) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();

  // Best-effort: also remove the file from storage if it lives in our bucket.
  const { data: row } = await supabase
    .from("releases")
    .select("download_url")
    .eq("id", id)
    .maybeSingle<{ download_url: string | null }>();

  if (row?.download_url) {
    const marker = "/storage/v1/object/public/releases/";
    const idx = row.download_url.indexOf(marker);
    if (idx !== -1) {
      const path = row.download_url.slice(idx + marker.length);
      await supabase.storage
        .from("releases")
        .remove([decodeURIComponent(path)])
        .catch(() => {});
    }
  }

  await supabase.from("releases").delete().eq("id", id);

  revalidatePath("/admin/releases");
  revalidatePath("/changelog");
  revalidatePath("/downloads");
}
