"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { createThreadAction } from "@/app/forums/actions";
import type { ForumCategoryRow } from "@/lib/supabase/database.types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Posting...
        </>
      ) : (
        <>
          <Send /> Post thread
        </>
      )}
    </Button>
  );
}

export function NewThreadView({
  categories,
}: {
  categories: ForumCategoryRow[];
}) {
  const params = useSearchParams();
  const initialCat = params.get("category") ?? categories[0]?.id ?? "";
  const [category, setCategory] = React.useState(initialCat);
  const [state, formAction] = useActionState(createThreadAction, null);

  return (
    <main className="container max-w-3xl pb-20 pt-10">
      <Link
        href="/forums"
        className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All forums
      </Link>

      <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
        New thread
      </h1>
      <p className="mt-3 text-[14px] text-muted-foreground">
        Pick a category, write a clear title, and share your thoughts. Members
        respond fastest to specific, well-written posts.
      </p>

      <form action={formAction} className="panel mt-8 space-y-5 p-7">
        {state?.error && (
          <div className="flex items-start gap-2.5 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-[12.5px] text-red-200">
            <AlertCircle className="size-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="category_id">Category</Label>
          <Select
            value={category}
            onValueChange={setCategory}
            name="category_id"
          >
            <SelectTrigger id="category_id">
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="category_id" value={category} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="Make it specific. Avoid clickbait."
            minLength={4}
            maxLength={200}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Body</Label>
          <Textarea
            id="body"
            name="body"
            placeholder="Write your post..."
            rows={12}
            minLength={1}
            maxLength={20000}
            required
          />
          <p className="text-[11px] text-muted-foreground/80">
            Markdown not supported yet. Plain text only.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" asChild>
            <Link href="/forums">Cancel</Link>
          </Button>
          <SubmitButton />
        </div>
      </form>
    </main>
  );
}
