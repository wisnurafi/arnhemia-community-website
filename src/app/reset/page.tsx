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
import {
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { resetPasswordAction } from "../(auth)/password-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Updating...
        </>
      ) : (
        <>
          Update password <ArrowRight />
        </>
      )}
    </Button>
  );
}

export default function ResetPage() {
  const [show, setShow] = React.useState(false);
  const [state, formAction] = useActionState(resetPasswordAction, null);

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
            <h1 className="font-display mt-8 text-3xl font-semibold tracking-tight text-gradient-silver">
              Set new password
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Pick something you won&apos;t need to recover again.
            </p>
          </div>

          <div className="panel glow-border mt-8 p-7">
            <form action={formAction} className="space-y-5">
              {state?.error && (
                <div className="flex items-start gap-2.5 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-[12.5px] text-red-200">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}
              {state?.success && (
                <div className="flex items-start gap-2.5 rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-2.5 text-[12.5px] text-emerald-200">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{state.success}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                  <Input
                    id="password"
                    name="password"
                    type={show ? "text" : "password"}
                    placeholder="At least 10 characters"
                    className="pl-10 pr-10"
                    minLength={10}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.04]"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                  <Input
                    id="confirm"
                    name="confirm"
                    type={show ? "text" : "password"}
                    placeholder="Type it again"
                    className="pl-10"
                    minLength={10}
                    required
                  />
                </div>
              </div>

              <SubmitButton />
            </form>
          </div>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            <Link
              href="/login"
              className="font-medium text-foreground hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
