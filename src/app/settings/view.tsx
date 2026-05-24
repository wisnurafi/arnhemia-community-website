"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import {
  updateProfileAction,
  changePasswordAction,
  deleteAccountAction,
} from "./actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/brand/role-badge";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Save,
  Lock,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import type { Profile } from "@/lib/supabase/database.types";
import { initials } from "@/lib/utils";

function SaveButton({ label = "Save changes" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Saving
        </>
      ) : (
        <>
          <Save /> {label}
        </>
      )}
    </Button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Deleting
        </>
      ) : (
        <>
          <Trash2 /> Delete
        </>
      )}
    </Button>
  );
}

function StateBanner({
  state,
}: {
  state: { error?: string; success?: string } | null;
}) {
  if (!state) return null;
  if (state.error) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-[12.5px] text-red-200">
        <AlertCircle className="size-4 shrink-0" />
        <span>{state.error}</span>
      </div>
    );
  }
  if (state.success) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-[12.5px] text-emerald-200">
        <CheckCircle2 className="size-4 shrink-0" />
        <span>{state.success}</span>
      </div>
    );
  }
  return null;
}

export function SettingsView({
  profile,
  email,
  twoFactorEnabled,
}: {
  profile: Profile;
  email: string | null;
  twoFactorEnabled: boolean;
}) {
  const [profileState, profileAction] = useActionState(updateProfileAction, null);
  const [passwordState, passwordAction] = useActionState(
    changePasswordAction,
    null,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteAccountAction,
    null,
  );

  const avatar =
    profile.avatar_url ??
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(profile.username)}`;

  return (
    <main className="container max-w-3xl pb-20 pt-10">
      <header>
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Account
        </span>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
          Preferences
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground">
          Update your profile, password, and account.
        </p>
      </header>

      <section className="panel mt-8 p-7">
        <div className="flex items-center gap-4 border-b border-white/[0.06] pb-5">
          <Avatar className="size-16 ring-2 ring-white/10">
            <AvatarImage src={avatar} alt={profile.username} />
            <AvatarFallback>{initials(profile.username)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">
                {profile.username}
              </h2>
              <RoleBadge role={profile.role} />
            </div>
            <p className="text-[12.5px] text-muted-foreground">
              {email ?? "no email"}
            </p>
          </div>
        </div>

        <form action={profileAction} className="mt-5 space-y-4">
          <StateBanner state={profileState} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                defaultValue={profile.username}
                minLength={3}
                maxLength={32}
                pattern="[A-Za-z0-9_]+"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex h-10 items-center rounded-md border border-white/[0.06] bg-white/[0.02] px-3 text-[13px] text-muted-foreground">
                Managed by staff
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Textarea
              id="status"
              name="status"
              defaultValue={profile.status ?? ""}
              maxLength={140}
              placeholder="What are you grinding?"
              rows={2}
            />
          </div>

          <div className="flex justify-end">
            <SaveButton />
          </div>
        </form>
      </section>

      <section className="panel mt-6 p-7">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
          <Lock className="size-4 text-muted-foreground" />
          <h2 className="font-semibold tracking-tight">Change password</h2>
        </div>
        <form action={passwordAction} className="mt-5 space-y-4">
          <StateBanner state={passwordState} />
          <div className="space-y-2">
            <Label htmlFor="current">Current password</Label>
            <Input
              id="current"
              name="current"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="next">New password</Label>
              <Input
                id="next"
                name="next"
                type="password"
                minLength={10}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                minLength={10}
                autoComplete="new-password"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <SaveButton label="Update password" />
          </div>
        </form>
      </section>

      <section className="panel mt-6 p-7">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
          <ShieldCheck className="size-4 text-muted-foreground" />
          <h2 className="font-semibold tracking-tight">
            Two-factor authentication
          </h2>
          {twoFactorEnabled ? (
            <Badge variant="success" className="ml-auto">
              <CheckCircle2 className="size-3" /> Enabled
            </Badge>
          ) : (
            <Badge variant="muted" className="ml-auto">
              Disabled
            </Badge>
          )}
        </div>
        <p className="mt-3 text-[13px] text-muted-foreground">
          {twoFactorEnabled
            ? "Your account is protected with an authenticator app code at sign-in."
            : "Add a second step at sign-in using a one-time code from your authenticator app. Strongly recommended for staff and Vanguard members."}
        </p>
        <div className="mt-4 flex justify-end">
          <Button asChild variant={twoFactorEnabled ? "outline" : "default"}>
            <Link href="/settings/2fa">
              {twoFactorEnabled ? "Manage 2FA" : "Set up 2FA"} <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <section className="panel mt-6 p-7 border-red-500/20">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
          <Trash2 className="size-4 text-red-300" />
          <h2 className="font-semibold tracking-tight text-red-200">
            Delete account
          </h2>
        </div>
        <p className="mt-3 text-[13px] text-muted-foreground">
          Removes your profile and all your threads, posts, tickets,
          conversations, and reactions. This cannot be undone.
        </p>
        <form action={deleteAction} className="mt-4 space-y-3">
          <StateBanner state={deleteState} />
          <div className="flex gap-3">
            <Input
              name="confirm"
              placeholder={`Type "${profile.username}" to confirm`}
              className="flex-1"
              required
            />
            <DeleteButton />
          </div>
        </form>
      </section>
    </main>
  );
}
