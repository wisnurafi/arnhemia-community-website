"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/brand/role-badge";
import { createInviteAction, revokeInviteAction } from "./actions";
import type { InviteCode, Profile } from "@/lib/supabase/database.types";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  Copy,
  Check,
  KeyRound,
  Plus,
  Loader2,
  Trash2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function CreateButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Plus /> Generate code
        </>
      )}
    </Button>
  );
}

export function InviteAdminView({
  role,
  invites,
}: {
  role: Profile["role"];
  invites: InviteCode[];
}) {
  const [createState, createAction] = useActionState(createInviteAction, null);
  const [revokeState, revokeAction] = useActionState(revokeInviteAction, null);
  const [copied, setCopied] = React.useState<string | null>(null);

  function copy(code: string) {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied((c) => (c === code ? null : c)), 1800);
  }

  return (
    <main className="container pb-20 pt-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Admin
          </span>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
            Invite codes
          </h1>
          <p className="mt-3 max-w-xl text-[14px] text-muted-foreground">
            Generate single-use invites for trusted recruits. Each code burns
            the moment someone registers with it. Revoke any unused code if it
            leaks.
          </p>
        </div>
        <RoleBadge role={role} />
      </header>

      {createState?.code && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 panel glow-border relative overflow-hidden p-6"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/[0.06] via-transparent to-transparent" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06]">
                <Sparkles className="size-4 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-100">
                  New invite generated
                </h3>
                <p className="font-mono mt-0.5 text-[16px] tracking-[0.22em] text-foreground">
                  {createState.code}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-emerald-100/70">
                  Single-use · burns on first registration
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => copy(createState.code!)}
              className="gap-2"
            >
              {copied === createState.code ? (
                <>
                  <Check className="text-emerald-300" /> Copied
                </>
              ) : (
                <>
                  <Copy /> Copy code
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <form
          action={createAction}
          className="panel space-y-4 p-6 h-fit"
        >
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-muted-foreground" />
            <h2 className="font-semibold tracking-tight">Generate new invite</h2>
          </div>

          {createState?.error && (
            <div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-[12.5px] text-red-200">
              <AlertCircle className="size-4 shrink-0" />
              <span>{createState.error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              name="note"
              placeholder="For Kestrel — Asia ranked"
              maxLength={200}
            />
            <p className="text-[11px] text-muted-foreground/80">
              Internal label only. Recipients never see it.
            </p>
          </div>

          <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[12px] text-muted-foreground">
            Codes never expire on the calendar. They die on first use.
          </div>

          <CreateButton />
        </form>

        <div className="panel p-2">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Your invites
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {invites.length} total
            </span>
          </div>

          {revokeState?.error && (
            <div className="m-2 flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-[12.5px] text-red-200">
              <AlertCircle className="size-4 shrink-0" />
              <span>{revokeState.error}</span>
            </div>
          )}

          {invites.length === 0 ? (
            <div className="p-10 text-center text-[13px] text-muted-foreground">
              No invites yet. Generate one above.
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {invites.map((inv) => {
                const used = !!inv.used_by;
                return (
                  <li
                    key={inv.code}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3",
                      used && "opacity-60",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-[13px] tracking-[0.16em] text-foreground">
                          {inv.code}
                        </code>
                        {used ? (
                          <Badge variant="success">Used</Badge>
                        ) : (
                          <Badge variant="info">Active</Badge>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                        {inv.note ? `${inv.note} · ` : ""}
                        Created <RelativeTime date={inv.created_at} />
                        {used && inv.used_at ? (
                          <>
                            {" · Used "}
                            <RelativeTime date={inv.used_at} />
                          </>
                        ) : null}
                      </div>
                    </div>
                    <button
                      onClick={() => copy(inv.code)}
                      className="rounded-md border border-white/[0.08] p-2 text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                      aria-label="Copy code"
                      type="button"
                    >
                      {copied === inv.code ? (
                        <Check className="size-3.5 text-emerald-300" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                    {!used && (
                      <form action={revokeAction}>
                        <input type="hidden" name="code" value={inv.code} />
                        <button
                          type="submit"
                          className="rounded-md border border-red-500/20 p-2 text-red-300/80 hover:bg-red-500/[0.08] hover:text-red-200"
                          aria-label="Revoke code"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
