"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  enrollTotpAction,
  verifyEnrollmentAction,
  disableTotpAction,
} from "@/app/(auth)/mfa-actions";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";

function VerifyButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Verifying...
        </>
      ) : (
        <>
          <ShieldCheck /> Enable 2FA
        </>
      )}
    </Button>
  );
}

function DisableButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Disabling
        </>
      ) : (
        <>
          <Trash2 /> Disable
        </>
      )}
    </Button>
  );
}

export function TwoFactorClient({ enabled }: { enabled: boolean }) {
  const [enrollment, setEnrollment] = React.useState<
    | null
    | {
        factorId: string;
        qrCode: string;
        secret: string;
        uri: string;
      }
  >(null);
  const [enrollErr, setEnrollErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  async function startEnroll() {
    setBusy(true);
    setEnrollErr(null);
    const res = await enrollTotpAction();
    setBusy(false);
    if ("error" in res) {
      setEnrollErr(res.error);
      return;
    }
    setEnrollment(res);
  }

  const [verifyState, verifyAction] = useActionState(
    verifyEnrollmentAction,
    null,
  );
  const [disableState, disableAction] = useActionState(
    disableTotpAction,
    null,
  );

  React.useEffect(() => {
    if (verifyState?.success) setEnrollment(null);
  }, [verifyState]);

  if (enabled && !disableState?.success) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3">
          <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
          <div>
            <h3 className="font-semibold text-emerald-100">
              Two-factor authentication is enabled
            </h3>
            <p className="mt-1 text-[13px] text-emerald-100/70">
              You&apos;ll be asked for a 6-digit code every time you sign in
              from a new session.
            </p>
          </div>
        </div>

        <div className="panel border-red-500/20 p-5">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <Trash2 className="size-4 text-red-300" />
            <h3 className="font-semibold tracking-tight text-red-200">
              Disable 2FA
            </h3>
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Removes 2FA from your account. We&apos;ll re-verify your password
            before disabling it.
          </p>
          <form action={disableAction} className="mt-4 space-y-3">
            {disableState?.error && (
              <div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-[12.5px] text-red-200">
                <AlertCircle className="size-4 shrink-0" />
                <span>{disableState.error}</span>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                name="password"
                type="password"
                placeholder="Current password"
                required
                autoComplete="current-password"
              />
              <DisableButton />
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (disableState?.success) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3">
          <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
          <div>
            <h3 className="font-semibold text-emerald-100">{disableState.success}</h3>
            <p className="mt-1 text-[13px] text-emerald-100/70">
              You can re-enroll a new authenticator at any time.
            </p>
          </div>
        </div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" /> Back to preferences
        </Link>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="space-y-4">
        {enrollErr && (
          <div className="flex items-start gap-2.5 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-[12.5px] text-red-200">
            <AlertCircle className="size-4 shrink-0" />
            <span>{enrollErr}</span>
          </div>
        )}
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-200" />
            <h3 className="font-semibold tracking-tight">
              Recommended for staff
            </h3>
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Use any TOTP authenticator app — Google Authenticator, Authy, 1Password,
            Bitwarden, Aegis, Raivo. We&apos;ll show you a QR code to scan.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={startEnroll}
          disabled={busy}
        >
          {busy ? (
            <>
              <Loader2 className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              <ShieldCheck /> Set up 2FA
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ol className="space-y-3 text-[13.5px]">
        <li>
          <span className="font-semibold">1.</span> Open your authenticator app
          and choose <span className="font-mono">Add new account</span>.
        </li>
        <li>
          <span className="font-semibold">2.</span> Scan the QR code below, or
          enter the secret manually.
        </li>
        <li>
          <span className="font-semibold">3.</span> Type the 6-digit code your
          app shows.
        </li>
      </ol>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
        <div className="rounded-lg border border-white/[0.08] bg-white p-3">
          {/*  Supabase returns SVG already wrapped, render as data URI. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enrollment.qrCode}
            alt="2FA QR code"
            className="size-40"
          />
        </div>
        <div className="min-w-0 space-y-2">
          <Label className="text-[10.5px]">Manual secret</Label>
          <div className="flex items-center gap-2">
            <code className="min-w-0 truncate rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2 font-mono text-[12.5px] tracking-[0.18em]">
              {enrollment.secret}
            </code>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => {
                navigator.clipboard?.writeText(enrollment.secret);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              aria-label="Copy secret"
            >
              {copied ? (
                <CheckCircle2 className="text-emerald-300" />
              ) : (
                <Copy />
              )}
            </Button>
          </div>
          <p className="text-[11.5px] text-muted-foreground">
            Algorithm SHA-1, 6 digits, 30s period.
          </p>
        </div>
      </div>

      <form action={verifyAction} className="space-y-3 border-t border-white/[0.06] pt-4">
        <input type="hidden" name="factor_id" value={enrollment.factorId} />
        {verifyState?.error && (
          <div className="flex items-start gap-2.5 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-[12.5px] text-red-200">
            <AlertCircle className="size-4 shrink-0" />
            <span>{verifyState.error}</span>
          </div>
        )}
        {verifyState?.success && (
          <div className="flex items-start gap-2.5 rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-2.5 text-[12.5px] text-emerald-200">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{verifyState.success}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            minLength={6}
            pattern="\d{6}"
            placeholder="000000"
            required
            className="font-mono tracking-[0.4em] text-center"
          />
          <VerifyButton />
        </div>
      </form>

      <div className="text-[12px]">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          Cancel
        </Link>
      </div>
    </div>
  );
}
