"use client";

import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, AlertCircle, Loader2, Send } from "lucide-react";
import { createTicketAction } from "../actions";

const CATEGORIES = [
  "Valorant Support",
  "Loader Issues",
  "Purchase Help",
  "Technical Support",
  "Account Support",
] as const;

const PRIORITIES = [
  { value: "low", label: "Low — minor issue" },
  { value: "medium", label: "Medium — affects gameplay" },
  { value: "high", label: "High — can't play" },
  { value: "critical", label: "Critical — account/billing" },
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Opening...
        </>
      ) : (
        <>
          <Send /> Open ticket
        </>
      )}
    </Button>
  );
}

export function NewTicketView() {
  const [state, formAction] = useActionState(createTicketAction, null);

  return (
    <main className="container max-w-3xl pb-20 pt-10">
      <Link
        href="/tickets"
        className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All tickets
      </Link>

      <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
        Open ticket
      </h1>
      <p className="mt-3 text-[14px] text-muted-foreground">
        Be specific. Include logs, screenshots, and what you've already tried.
        Staff responds faster to detailed tickets.
      </p>

      <form action={formAction} className="panel mt-8 space-y-5 p-7">
        {state?.error && (
          <div className="flex items-start gap-2.5 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-[12.5px] text-red-200">
            <AlertCircle className="size-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue="Valorant Support">
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select name="priority" defaultValue="medium">
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            placeholder="Loader fails to inject on Win11 24H2"
            minLength={6}
            maxLength={200}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Description</Label>
          <Textarea
            id="body"
            name="body"
            placeholder="Describe the issue, what you've tried, and any error messages."
            rows={10}
            minLength={10}
            maxLength={20000}
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" asChild>
            <Link href="/tickets">Cancel</Link>
          </Button>
          <SubmitButton />
        </div>
      </form>
    </main>
  );
}
