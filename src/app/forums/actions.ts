"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { sendAlertEmail } from "@/lib/email";

type State = { error?: string; success?: string } | null;

export async function createThreadAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Sign in to post." };

  const categoryId = String(formData.get("category_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!categoryId) return { error: "Pick a category." };
  if (title.length < 4 || title.length > 200) {
    return { error: "Title must be 4-200 chars." };
  }
  if (body.length < 1 || body.length > 20000) {
    return { error: "Body must be 1-20000 chars." };
  }

  const supabase = await createClient();

  // Staff-only categories (Announcements, Loader & Releases) can only be
  // posted to by owner / co-owner / devs.
  const { data: category } = await supabase
    .from("forum_categories")
    .select("staff_only")
    .eq("id", categoryId)
    .maybeSingle<{ staff_only: boolean }>();

  if (!category) return { error: "Category not found." };

  const role = session.profile.role;
  const isStaff =
    role === "owner" || role === "co-owner" || role === "devs";
  if (category.staff_only && !isStaff) {
    return {
      error: "This category is staff-only. Members can read but not post.",
    };
  }

  const { data, error } = await supabase
    .from("threads")
    .insert({
      category_id: categoryId,
      author_id: session.id,
      title,
      body,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create." };

  revalidatePath("/forums");
  revalidatePath(`/forums/${categoryId}`);
  redirect(`/threads/${data.id}`);
}

export async function createPostAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await getSession();
  if (!session) return { error: "Sign in to reply." };

  const threadId = String(formData.get("thread_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!threadId) return { error: "Missing thread." };
  if (body.length < 1 || body.length > 10000) {
    return { error: "Reply must be 1-10000 chars." };
  }

  const supabase = await createClient();

  // Block replies to locked threads.
  const { data: thread } = await supabase
    .from("threads")
    .select("locked, author_id, title")
    .eq("id", threadId)
    .maybeSingle<{ locked: boolean; author_id: string; title: string }>();

  if (!thread) return { error: "Thread not found." };
  if (thread.locked) return { error: "Thread is locked." };

  const { error } = await supabase.from("posts").insert({
    thread_id: threadId,
    author_id: session.id,
    body,
  });

  if (error) return { error: error.message };

  // Notify thread author (if not self-reply)
  if (thread.author_id !== session.id) {
    const { error: alertError } = await supabase.from("alerts").insert({
      recipient_id: thread.author_id,
      actor_id: session.id,
      kind: "reply",
      text: `${session.profile.username} replied to your thread`,
      link: `/threads/${threadId}`,
    });
    if (alertError) {
      // eslint-disable-next-line no-console
      console.error("[alerts] reply insert failed", alertError);
    }

    await sendAlertEmail({
      recipientId: thread.author_id,
      kind: "reply",
      subject: thread.title,
      preview: `${session.profile.username} replied to your thread "${thread.title}".`,
      link: `/threads/${threadId}`,
      actorUsername: session.profile.username,
    });
  }

  revalidatePath(`/threads/${threadId}`);
  return { success: "Reply posted." };
}

export async function deleteThreadAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const threadId = String(formData.get("thread_id") ?? "");
  if (!threadId) return;

  const supabase = await createClient();
  const { data: thread } = await supabase
    .from("threads")
    .select("category_id, author_id")
    .eq("id", threadId)
    .maybeSingle<{ category_id: string; author_id: string }>();

  if (!thread) return;
  if (
    thread.author_id !== session.id &&
    session.profile.role === "member"
  ) {
    return;
  }

  await supabase.from("threads").delete().eq("id", threadId);

  revalidatePath("/forums");
  revalidatePath(`/forums/${thread.category_id}`);
  redirect(`/forums/${thread.category_id}`);
}

export async function toggleThreadLockAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.profile.role === "member") return;

  const threadId = String(formData.get("thread_id") ?? "");
  const lock = formData.get("lock") === "1";

  const supabase = await createClient();
  await supabase
    .from("threads")
    .update({ locked: lock })
    .eq("id", threadId);

  revalidatePath(`/threads/${threadId}`);
}

export async function toggleThreadPinAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.profile.role === "member") return;

  const threadId = String(formData.get("thread_id") ?? "");
  const pin = formData.get("pin") === "1";

  const supabase = await createClient();
  await supabase
    .from("threads")
    .update({ pinned: pin })
    .eq("id", threadId);

  revalidatePath(`/threads/${threadId}`);
}

export async function toggleBookmarkAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;

  const threadId = String(formData.get("thread_id") ?? "");
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", session.id)
    .eq("thread_id", threadId)
    .maybeSingle();

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("bookmarks")
      .insert({ user_id: session.id, thread_id: threadId });
  }

  revalidatePath(`/threads/${threadId}`);
  revalidatePath("/bookmarks");
}

export async function toggleReactionAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;

  const targetType = String(formData.get("target_type") ?? "") as
    | "thread"
    | "post";
  const targetId = String(formData.get("target_id") ?? "");
  const emoji = String(formData.get("emoji") ?? "like");

  if (!["thread", "post"].includes(targetType) || !targetId) return;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("user_id", session.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
  } else {
    await supabase.from("reactions").insert({
      user_id: session.id,
      target_type: targetType,
      target_id: targetId,
      emoji,
    });
  }

  const refer = String(formData.get("refer") ?? "");
  if (refer) revalidatePath(refer);
}
