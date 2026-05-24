"use client";

import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { replyTicketAction, setTicketStatusAction } from "../actions";
import type { TicketStatus } from "@/lib/supabase/database.types";

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

export function TicketReplyForm({
  ticketId,
  isStaff,
}: {
  ticketId: string;
  isStaff: boolean;
}) {
  const [state, formAction] = useActionState(replyTicketAction, null);
  const ref = useRef<HTMLTextAreaElement>(null);

  if (state?.success && ref.current) ref.current.value = "";

  return (
    <form action={formAction} className="panel p-4">
      <input type="hidden" name="ticket_id" value={ticketId} />
      {state?.error && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-[12.5px] text-red-200">
          <AlertCircle className="size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      <Textarea
        ref={ref}
        name="body"
        placeholder="Write your reply..."
        rows={5}
        required
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {isStaff ? (
          <label className="flex cursor-pointer select-none items-center gap-2 text-[12px] text-muted-foreground">
            <Checkbox name="staff_note" />
            Staff-only note (visible to staff)
          </label>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            Replies are visible to staff and you only.
          </p>
        )}
        <ReplyButton />
      </div>
    </form>
  );
}

export function TicketStatusButtons({
  ticketId,
  status,
  canStaff,
  canCloseAsAuthor,
}: {
  ticketId: string;
  status: TicketStatus;
  canStaff: boolean;
  canCloseAsAuthor: boolean;
}) {
  const targets = ([
    { label: "Mark answered", value: "answered" as TicketStatus, show: canStaff },
    { label: "Mark pending", value: "pending" as TicketStatus, show: canStaff },
    { label: "Reopen", value: "open" as TicketStatus, show: canStaff && status === "closed" },
    {
      label: "Close",
      value: "closed" as TicketStatus,
      show: (canStaff || canCloseAsAuthor) && status !== "closed",
    },
  ] as const).filter((t) => t.show);

  if (targets.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {targets.map((t) => (
        <form key={t.value} action={setTicketStatusAction}>
          <input type="hidden" name="ticket_id" value={ticketId} />
          <input type="hidden" name="status" value={t.value} />
          <Button
            type="submit"
            size="sm"
            variant={t.value === "closed" ? "destructive" : "outline"}
          >
            {t.label}
          </Button>
        </form>
      ))}
    </div>
  );
}

export { Label };
