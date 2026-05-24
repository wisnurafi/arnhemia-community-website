"use client";

import * as React from "react";
import { Suspense } from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArnhemiaWordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { verifyLoginMfaAction } from "../../(auth)/mfa-actions";
import { logoutAction } from "../../(auth)/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Verifying...
        </>
      ) : (
        <>
          Verify code <ArrowRight />
        </>
      )}
    </Button>
  );
}

function MfaForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/forums";
  const [state, formAction] = useActionState(verifyLoginMfaAction, null);

  return (
    <form action={formAction} className="panel glow-border mt-8 p-7 space-y-5">
      <input type="hidden" name="redirect" value={redirect} />

      {state?.error && (
        <div className="flex items-start gap-2.5 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-[12.5px] text-red-200">
          <AlertCircle className="size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="code">Authenticator code</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          minLength={6}
          pattern="\d{6}"
          placeholder="000000"
          className="text-center font-mono text-lg tracking-[0.4em]"
          required
          autoFocus
        />
        <p className="text-[11.5px] text-muted-foreground/80">
          Open your authenticator app and enter the current 6-digit code.
        </p>
      </div>

      <SubmitButton />
    </form>
  );
}

export default function MfaPage() {
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
                Two-factor required
              </span>
            </div>
            <h1 className="font-display mt-5 text-3xl font-semibold tracking-tight text-gradient-silver">
              Verify it&apos;s you
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Enter the code from your authenticator app to finish signing in.
            </p>
          </div>

          <Suspense fallback={<div className="panel mt-8 h-[280px]" />}>
            <MfaForm />
          </Suspense>

          <div className="mt-6 flex items-center justify-center gap-2 text-[12.5px] text-muted-foreground">
            <span>Lost your device?</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="font-medium text-foreground hover:underline"
              >
                Sign out
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
