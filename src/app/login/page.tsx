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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { loginAction } from "../(auth)/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          Sign in
          <ArrowRight />
        </>
      )}
    </Button>
  );
}

function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/forums";

  const [state, formAction] = useActionState(loginAction, null);

  return (
    <div className="panel glow-border mt-8 p-7">
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="redirect" value={redirect} />

        {state?.error && (
          <div className="flex items-start gap-2.5 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-[12.5px] text-red-200">
            <AlertCircle className="size-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              id="email"
              name="email"
              type="email"
              className="pl-10"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot"
              className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="pl-10 pr-10"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.04]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer select-none items-center gap-2.5 text-[13px] text-foreground/85">
            <Checkbox
              name="remember"
              checked={remember}
              onCheckedChange={(v) => setRemember(Boolean(v))}
            />
            Remember me for 30 days
          </label>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}

export default function LoginPage() {
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
              Welcome back
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Sign in to access the community.
            </p>
          </div>

          <Suspense fallback={<div className="panel mt-8 h-[440px]" />}>
            <LoginForm />
          </Suspense>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-foreground hover:underline"
            >
              Apply with invite code
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
