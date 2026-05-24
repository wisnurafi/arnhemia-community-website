"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { deleteReleaseAction, togglePublishedAction } from "./actions";
import type { ReleaseKind, ReleaseRow } from "@/lib/supabase/database.types";

const KINDS: ReleaseKind[] = ["release", "hotfix", "patch"];

function ToggleButton({
  published,
}: {
  published: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button size="sm" variant="ghost" type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : published ? (
        <>
          <EyeOff className="size-3.5" /> Unpublish
        </>
      ) : (
        <>
          <Eye className="size-3.5" /> Publish
        </>
      )}
    </Button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="sm" variant="destructive" type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <>
          <Trash2 className="size-3.5" /> Delete
        </>
      )}
    </Button>
  );
}

export function ReleasesAdminView({ releases }: { releases: ReleaseRow[] }) {
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [kind, setKind] = React.useState<ReleaseKind>("release");
  const [submitting, setSubmitting] = React.useState(false);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [state, setState] = React.useState<
    | { error: string }
    | { success: string }
    | null
  >(null);

  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setState(null);
    setSubmitting(true);
    setProgress(0);

    const fd = new FormData(e.currentTarget);

    try {
      const ok = await uploadWithProgress(
        "/api/admin/releases",
        fd,
        (pct) => setProgress(pct),
      );
      if (ok.ok) {
        setState({ success: ok.message ?? "Saved." });
        formRef.current?.reset();
        if (fileRef.current) fileRef.current.value = "";
        setKind("release");
        router.refresh();
      } else {
        setState({ error: ok.error ?? "Could not save." });
      }
    } catch (err) {
      setState({
        error: err instanceof Error ? err.message : "Unexpected error.",
      });
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  }

  return (
    <main className="container max-w-5xl pb-20 pt-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Admin
          </span>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
            Releases
          </h1>
          <p className="mt-3 max-w-xl text-[14px] text-muted-foreground">
            Upload loader builds and publish release notes. Files up to 200MB
            go straight to Supabase Storage and appear on /downloads for
            subscribed users.
          </p>
        </div>
      </header>

      <section className="panel mt-8 p-7">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
          <Plus className="size-4 text-muted-foreground" />
          <h2 className="font-semibold tracking-tight">Publish a release</h2>
        </div>

        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="mt-5 space-y-5"
        >
          {state && "error" in state && (
            <div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-[12.5px] text-red-200">
              <AlertCircle className="size-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}
          {state && "success" in state && (
            <div className="flex items-start gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-2.5 text-[12.5px] text-emerald-200">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{state.success}</span>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                name="version"
                placeholder="v3.9.0"
                required
                maxLength={64}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kind">Kind</Label>
              <Select
                value={kind}
                onValueChange={(v) => setKind(v as ReleaseKind)}
              >
                <SelectTrigger id="kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KINDS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="kind" value={kind} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="released_at">Released</Label>
              <Input
                id="released_at"
                name="released_at"
                type="date"
                defaultValue={today}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Release notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={6}
              placeholder={
                "One bullet per line, no dashes. Example:\nFixed handshake timing\nReduced injection latency"
              }
            />
            <p className="text-[11px] text-muted-foreground/80">
              Each non-empty line becomes a bullet on /changelog and /downloads.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="file">Loader binary (optional)</Label>
              <Input
                ref={fileRef}
                id="file"
                name="file"
                type="file"
                accept=".exe,.zip,.msi,.7z,.dmg,application/octet-stream"
              />
              <p className="text-[11px] text-muted-foreground/80">
                Max 200MB. Stored in the public `releases` bucket.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="download_url">External URL (optional)</Label>
              <Input
                id="download_url"
                name="download_url"
                type="url"
                placeholder="https://your-cdn.example.com/loader.exe"
              />
              <p className="text-[11px] text-muted-foreground/80">
                Used only when no file is uploaded.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="checksum">SHA-256 checksum (optional)</Label>
              <Input
                id="checksum"
                name="checksum"
                placeholder="sha256:abc123..."
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <Checkbox name="published" defaultChecked />
                <span className="text-[13px]">Publish immediately</span>
              </label>
            </div>
          </div>

          {progress !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Uploading</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" /> Saving
                </>
              ) : (
                <>
                  <Save /> Save release
                </>
              )}
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <Upload className="size-3.5 text-muted-foreground" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Existing releases
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
        </div>

        <div className="panel mt-4 divide-y divide-white/[0.04]">
          {releases.length === 0 ? (
            <div className="p-12 text-center text-[13px] text-muted-foreground">
              No releases yet. Publish your first one above.
            </div>
          ) : (
            releases.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-1 gap-3 px-4 py-3.5 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        r.kind === "release"
                          ? "elite"
                          : r.kind === "hotfix"
                            ? "warning"
                            : "muted"
                      }
                    >
                      {r.kind}
                    </Badge>
                    <span className="font-display text-base tracking-tight">
                      {r.version}
                    </span>
                    {r.published ? (
                      <Badge variant="success">
                        <Eye className="size-3" /> Published
                      </Badge>
                    ) : (
                      <Badge variant="muted">
                        <EyeOff className="size-3" /> Draft
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1.5 text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground">
                    {r.released_at}
                    {r.download_url && " · file attached"}
                    {r.checksum && " · checksum present"}
                  </div>
                  {r.notes && r.notes.length > 0 && (
                    <ul className="mt-2 space-y-0.5 text-[12.5px] text-muted-foreground">
                      {r.notes.slice(0, 3).map((n) => (
                        <li key={n} className="truncate">
                          · {n}
                        </li>
                      ))}
                      {r.notes.length > 3 && (
                        <li className="text-muted-foreground/60">
                          +{r.notes.length - 3} more
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  {r.download_url && (
                    <Button asChild size="sm" variant="outline">
                      <a href={r.download_url} target="_blank" rel="noreferrer">
                        Download
                      </a>
                    </Button>
                  )}
                  <form action={togglePublishedAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input
                      type="hidden"
                      name="published"
                      value={r.published ? "0" : "1"}
                    />
                    <ToggleButton published={r.published} />
                  </form>
                  <form action={deleteReleaseAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <DeleteButton />
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function uploadWithProgress(
  url: string,
  body: FormData,
  onProgress: (pct: number) => void,
): Promise<{ ok: boolean; message?: string; error?: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let parsed: { ok?: boolean; message?: string; error?: string } = {};
      try {
        parsed = JSON.parse(xhr.responseText);
      } catch {
        parsed = { error: `Server returned ${xhr.status}` };
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ ok: true, message: parsed.message });
      } else {
        resolve({
          ok: false,
          error: parsed.error ?? `Server returned ${xhr.status}`,
        });
      }
    };
    xhr.onerror = () =>
      resolve({ ok: false, error: "Network error during upload." });
    xhr.send(body);
  });
}
