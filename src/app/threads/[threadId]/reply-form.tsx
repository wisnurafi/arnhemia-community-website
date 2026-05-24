"use client";

import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { createPostAction } from "@/app/forums/actions";

function ReplyButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Posting...
        </>
      ) : (
        <>
          <Send /> Reply
        </>
      )}
    </Button>
  );
}

export function ReplyForm({ threadId }: { threadId: string }) {
  const [state, formAction] = useActionState(createPostAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (state?.success && textareaRef.current) {
    textareaRef.current.value = "";
  }

  return (
    <form ref={formRef} action={formAction} className="panel mt-3 p-4">
      <input type="hidden" name="thread_id" value={threadId} />

      {state?.error && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-[12.5px] text-red-200">
          <AlertCircle className="size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <Textarea
        ref={textareaRef}
        name="body"
        placeholder="Write a reply..."
        rows={5}
        minLength={1}
        maxLength={10000}
        required
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">
          Be respectful. Re-read before posting.
        </p>
        <ReplyButton />
      </div>
    </form>
  );
}
