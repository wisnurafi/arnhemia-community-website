"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleBadge } from "@/components/brand/role-badge";
import { setRoleAction, setSubscriptionAction } from "./actions";
import { cn, initials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import type { Profile, Role } from "@/lib/supabase/database.types";

const ROLES: Role[] = ["owner", "co-owner", "devs", "member"];

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Save className="size-3.5" />
      )}
      Save
    </Button>
  );
}

function SubButton({ subscribed }: { subscribed: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="sm"
      variant={subscribed ? "outline" : "default"}
      disabled={pending}
      className="min-w-[112px]"
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : subscribed ? (
        <>
          <XCircle className="size-3.5" /> Unsubscribe
        </>
      ) : (
        <>
          <Sparkles className="size-3.5" /> Subscribe
        </>
      )}
    </Button>
  );
}

export function MembersAdminView({
  profiles,
  myId,
  myRole,
  initialQuery,
}: {
  profiles: Profile[];
  myId: string;
  myRole: Role;
  initialQuery: string;
}) {
  const [roleState, roleAction] = useActionState(setRoleAction, null);
  const [subState, subAction] = useActionState(setSubscriptionAction, null);
  const [query, setQuery] = React.useState(initialQuery);

  const state = roleState?.error || roleState?.success
    ? roleState
    : subState;

  const canManageSubs = myRole === "owner" || myRole === "co-owner";

  return (
    <main className="container max-w-5xl pb-20 pt-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Admin
          </span>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
            Members
          </h1>
          <p className="mt-3 max-w-xl text-[14px] text-muted-foreground">
            Manage roles and subscriptions. Owner and Co-Owner can change
            member, devs, and co-owner roles. Only an Owner can promote to
            Owner or demote an existing Owner.
          </p>
        </div>
        <RoleBadge role={myRole} />
      </header>

      {state?.error && (
        <div className="mt-6 flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-[12.5px] text-red-200">
          <AlertCircle className="size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      {state?.success && (
        <div className="mt-6 flex items-start gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-2.5 text-[12.5px] text-emerald-200">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{state.success}</span>
        </div>
      )}

      <form
        method="get"
        action="/admin/members"
        className="mt-8 panel p-3.5"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            name="q"
            placeholder="Search by username..."
            className="h-10 pl-9"
          />
        </div>
      </form>

      <div className="panel mt-6 divide-y divide-white/[0.04]">
        {profiles.length === 0 ? (
          <div className="p-12 text-center text-[13px] text-muted-foreground">
            No profiles match.
          </div>
        ) : (
          profiles.map((p) => {
            const isSelf = p.id === myId;
            const isOwner = p.role === "owner";
            const canEdit =
              !isSelf &&
              (myRole === "owner" ||
                (myRole === "co-owner" && !isOwner));
            const canPromoteToOwner = myRole === "owner";
            const isStaff = p.role !== "member";
            // Staff are always considered subscribed for download access.
            const effectivelySubscribed = p.subscribed || isStaff;

            return (
              <div
                key={p.id}
                className={cn(
                  "grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-[1fr_auto] md:items-center",
                )}
              >
                <Link
                  href={`/u/${p.username}`}
                  className="flex items-center gap-3"
                >
                  <Avatar className="size-10">
                    <AvatarImage
                      src={
                        p.avatar_url ??
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${p.username}`
                      }
                      alt={p.username}
                    />
                    <AvatarFallback>{initials(p.username)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[14px] font-semibold">
                        {p.username}
                      </span>
                      <RoleBadge role={p.role} />
                      {isSelf && <Badge variant="muted">You</Badge>}
                      {effectivelySubscribed ? (
                        <Badge variant="elite">
                          <Sparkles className="size-3" />
                          {isStaff && !p.subscribed
                            ? "Staff access"
                            : "Subscribed"}
                        </Badge>
                      ) : (
                        <Badge variant="muted">Free</Badge>
                      )}
                    </div>
                    <div className="text-[11.5px] text-muted-foreground">
                      Joined <RelativeTime date={p.joined_at} />
                    </div>
                  </div>
                </Link>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  {canEdit ? (
                    <form
                      action={roleAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="user_id" value={p.id} />
                      <Select name="role" defaultValue={p.role}>
                        <SelectTrigger className="h-9 w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem
                              key={r}
                              value={r}
                              disabled={r === "owner" && !canPromoteToOwner}
                            >
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <SaveButton />
                    </form>
                  ) : (
                    <span className="text-[11.5px] text-muted-foreground">
                      {isSelf
                        ? "Can't change your own role."
                        : isOwner && myRole === "co-owner"
                          ? "Owner-only edit."
                          : "View only."}
                    </span>
                  )}

                  {canManageSubs && !isStaff && !isSelf && (
                    <form action={subAction}>
                      <input type="hidden" name="user_id" value={p.id} />
                      <input
                        type="hidden"
                        name="subscribed"
                        value={p.subscribed ? "0" : "1"}
                      />
                      <SubButton subscribed={p.subscribed} />
                    </form>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
