"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArnhemiaWordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  RotateCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { registerAction } from "../(auth)/actions";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full"
      disabled={disabled || pending}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" />
          Creating account...
        </>
      ) : (
        <>
          Create account
          <ArrowRight />
        </>
      )}
    </Button>
  );
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [terms, setTerms] = React.useState(false);
  const [captchaChecked, setCaptchaChecked] = React.useState(false);
  const [state, formAction] = useActionState(registerAction, null);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-200px] h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.08),transparent_70%)] blur-2xl" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <div className="container flex min-h-screen items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center">
            <Link href="/" className="inline-block">
              <ArnhemiaWordmark />
            </Link>
            <div className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 backdrop-blur">
              <ShieldCheck className="size-3 text-emerald-300/80" />
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-foreground/85">
                Invite-only registration
              </span>
            </div>
            <h1 className="font-display mt-5 text-3xl font-semibold tracking-tight text-gradient-silver">
              Apply to Arnhemia
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              You'll need a valid invite code to complete registration.
            </p>
          </div>

          <div className="panel glow-border mt-8 p-7">
            <form action={formAction} className="space-y-5">
              {state?.error && (
                <div
                  className={cn(
                    "flex items-start gap-2.5 rounded-md border px-3.5 py-2.5 text-[12.5px]",
                    state.success
                      ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200"
                      : "border-red-500/20 bg-red-500/[0.06] text-red-200",
                  )}
                >
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                  <Input
                    id="username"
                    name="username"
                    className="pl-10"
                    minLength={3}
                    maxLength={32}
                    pattern="[A-Za-z0-9_]+"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 10 characters"
                    className="pl-10 pr-10"
                    minLength={10}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.04]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground/80">
                  Use at least 10 characters with one number and one symbol.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite">Invite code</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                  <Input
                    id="invite"
                    name="invite"
                    className="pl-10 font-mono uppercase tracking-[0.16em]"
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground/80">
                  Codes are single-use and tied to your account on first use.
                </p>
              </div>

              <FakeCaptcha
                checked={captchaChecked}
                onChange={setCaptchaChecked}
              />
              <input
                type="hidden"
                name="captcha"
                value={captchaChecked ? "on" : ""}
              />

              <label className="flex cursor-pointer select-none items-start gap-2.5 text-[12.5px] text-foreground/85">
                <Checkbox
                  name="terms"
                  checked={terms}
                  onCheckedChange={(v) => setTerms(Boolean(v))}
                  className="mt-0.5"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/legal/tos" className="underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy" className="underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              <input type="hidden" name="terms" value={terms ? "on" : ""} />

              <SubmitButton disabled={!terms || !captchaChecked} />
            </form>
          </div>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            Already a member?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function FakeCaptcha({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const [loading, setLoading] = React.useState(false);

  function handleClick() {
    if (checked || loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onChange(true);
    }, 1200);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-white/15",
        checked && "border-emerald-400/30 bg-emerald-400/[0.04]",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "grid size-6 place-items-center rounded border border-white/15 bg-white/[0.04]",
            checked && "border-emerald-400/40 bg-emerald-400/15",
          )}
        >
          {loading ? (
            <RotateCw className="size-3.5 animate-spin text-muted-foreground" />
          ) : checked ? (
            <ShieldCheck className="size-4 text-emerald-300" />
          ) : null}
        </div>
        <span className="text-[13px] font-medium text-foreground/85">
          {loading
            ? "Verifying..."
            : checked
              ? "You're verified"
              : "I'm not a bot"}
        </span>
      </div>
      <div className="text-right">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
          captcha
        </div>
        <div className="font-display text-[10px] tracking-[0.18em] text-foreground/70">
          ARNHEMIA
        </div>
      </div>
    </button>
  );
}
