"use client";

import { Button } from "@/components/ui/button";
import {
  toggleBookmarkAction,
  toggleThreadLockAction,
  toggleThreadPinAction,
  deleteThreadAction,
  toggleReactionAction,
} from "@/app/forums/actions";
import { Bookmark, Heart, Lock, Pin, Trash2, Unlock } from "lucide-react";

export function ThreadActions({
  threadId,
  bookmarked,
  pinned,
  locked,
  canEdit,
  canMod,
}: {
  threadId: string;
  bookmarked: boolean;
  pinned: boolean;
  locked: boolean;
  canEdit: boolean;
  canMod: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={toggleReactionAction}>
        <input type="hidden" name="target_type" value="thread" />
        <input type="hidden" name="target_id" value={threadId} />
        <input type="hidden" name="emoji" value="like" />
        <input type="hidden" name="refer" value={`/threads/${threadId}`} />
        <Button type="submit" variant="ghost" size="sm">
          <Heart /> Like
        </Button>
      </form>

      <form action={toggleBookmarkAction}>
        <input type="hidden" name="thread_id" value={threadId} />
        <Button
          type="submit"
          variant={bookmarked ? "secondary" : "ghost"}
          size="sm"
        >
          <Bookmark className={bookmarked ? "fill-current" : ""} />
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
      </form>

      {canMod && (
        <>
          <form action={toggleThreadPinAction}>
            <input type="hidden" name="thread_id" value={threadId} />
            <input type="hidden" name="pin" value={pinned ? "0" : "1"} />
            <Button type="submit" variant="ghost" size="sm">
              <Pin /> {pinned ? "Unpin" : "Pin"}
            </Button>
          </form>
          <form action={toggleThreadLockAction}>
            <input type="hidden" name="thread_id" value={threadId} />
            <input type="hidden" name="lock" value={locked ? "0" : "1"} />
            <Button type="submit" variant="ghost" size="sm">
              {locked ? <Unlock /> : <Lock />}
              {locked ? "Unlock" : "Lock"}
            </Button>
          </form>
        </>
      )}

      {canEdit && (
        <form action={deleteThreadAction} className="ml-auto">
          <input type="hidden" name="thread_id" value={threadId} />
          <Button type="submit" variant="destructive" size="sm">
            <Trash2 /> Delete
          </Button>
        </form>
      )}
    </div>
  );
}
