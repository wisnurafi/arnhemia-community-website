import "server-only";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Email helper for transactional alerts (replies, mentions, DMs).
 *
 * Provider: MailerSend (https://mailersend.com), called via the HTTP API
 * directly so we don't need to add a runtime dependency for it.
 *
 * Setup:
 *   1. MAILERSEND_API_KEY  — get one at https://app.mailersend.com/api-tokens
 *   2. MAILERSEND_FROM     — from address (must be on a verified domain).
 *   3. MAILERSEND_FROM_NAME — display name (defaults to "Arnhemia").
 *   4. APP_URL             — public site URL used to build links in emails.
 *
 * If MAILERSEND_API_KEY is missing the helpers no-op silently so dev
 * environments keep working without email config.
 */

type AlertEmailKind = "reply" | "mention" | "message";

type SendAlertEmailInput = {
  recipientId: string;
  kind: AlertEmailKind;
  /** Short subject suffix, e.g. thread title or sender username. */
  subject: string;
  /** Plain-text preview of the alert. */
  preview: string;
  /** Optional deep link path (e.g. "/threads/<id>"). */
  link?: string | null;
  /** Username of the person who triggered the alert. */
  actorUsername?: string | null;
};

const APP_URL =
  process.env.APP_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "https://arnhemia.com";

const PREF_FIELD_BY_KIND: Record<
  AlertEmailKind,
  "email_replies" | "email_mentions" | "email_messages"
> = {
  reply: "email_replies",
  mention: "email_mentions",
  message: "email_messages",
};

/**
 * Build a Supabase admin client. We need the service role to read auth.users
 * (the recipient's email lives there, not in `profiles`).
 */
function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createSupabaseAdmin<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function recipientWantsEmail(
  recipientId: string,
  kind: AlertEmailKind,
): Promise<boolean> {
  const supabase = await createServerClient();
  const field = PREF_FIELD_BY_KIND[kind];
  const { data } = await supabase
    .from("alert_preferences")
    .select(field)
    .eq("user_id", recipientId)
    .maybeSingle<Record<string, boolean>>();
  // Default to opted-in when no preferences row exists yet.
  if (!data) return true;
  return data[field] !== false;
}

async function recipientEmail(recipientId: string): Promise<string | null> {
  const admin = getAdmin();
  if (!admin) return null;
  const { data, error } = await admin.auth.admin.getUserById(recipientId);
  if (error || !data?.user?.email) return null;
  return data.user.email;
}

function buildHtml({
  preview,
  actorUsername,
  link,
}: {
  preview: string;
  actorUsername?: string | null;
  link?: string | null;
}) {
  const url = link ? `${APP_URL}${link}` : APP_URL;
  const safePreview = escapeHtml(preview);
  const actorLine = actorUsername
    ? `<p style="margin:0 0 12px;color:#a1a1aa;font-size:13px;">From <strong style="color:#fff;">${escapeHtml(actorUsername)}</strong></p>`
    : "";
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0a0a;color:#e4e4e7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#71717a;margin-bottom:18px;">Arnhemia</div>
    ${actorLine}
    <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#e4e4e7;">${safePreview}</p>
    <a href="${url}" style="display:inline-block;background:#fff;color:#0a0a0a;text-decoration:none;font-weight:600;font-size:13px;padding:10px 18px;border-radius:8px;">Open in Arnhemia</a>
    <hr style="border:none;border-top:1px solid #27272a;margin:32px 0 16px;" />
    <p style="margin:0;font-size:11px;color:#52525b;line-height:1.5;">You're receiving this because notifications for this event are enabled. <a href="${APP_URL}/alerts/preferences" style="color:#a1a1aa;">Manage preferences</a>.</p>
  </div>
</body></html>`;
}

function buildText({
  preview,
  actorUsername,
  link,
}: {
  preview: string;
  actorUsername?: string | null;
  link?: string | null;
}) {
  const url = link ? `${APP_URL}${link}` : APP_URL;
  const lines = [
    actorUsername ? `From: ${actorUsername}` : null,
    "",
    preview,
    "",
    `Open: ${url}`,
    "",
    `Manage preferences: ${APP_URL}/alerts/preferences`,
  ].filter((l): l is string => l !== null);
  return lines.join("\n");
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendViaMailerSend({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.MAILERSEND_API_KEY?.trim();
  const fromEmail = process.env.MAILERSEND_FROM?.trim();
  const fromName = process.env.MAILERSEND_FROM_NAME?.trim() || "Arnhemia";
  if (!apiKey || !fromEmail) return;

  const res = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok && res.status !== 202) {
    const detail = await res.text().catch(() => "");
    // eslint-disable-next-line no-console
    console.error("[email] MailerSend send failed", res.status, detail);
  }
}

/**
 * Send a transactional alert email. Silently no-ops if:
 *   - MAILERSEND_API_KEY / MAILERSEND_FROM aren't set
 *   - SUPABASE_SERVICE_ROLE_KEY isn't set
 *   - recipient has opted out of this email kind
 *   - recipient has no email on file
 *
 * Errors are swallowed and logged; this should never throw and break the
 * server action that called it.
 */
export async function sendAlertEmail(input: SendAlertEmailInput): Promise<void> {
  if (!process.env.MAILERSEND_API_KEY) return;

  try {
    const [wants, to] = await Promise.all([
      recipientWantsEmail(input.recipientId, input.kind),
      recipientEmail(input.recipientId),
    ]);
    if (!wants || !to) return;

    const subjectPrefix =
      input.kind === "reply"
        ? "New reply"
        : input.kind === "mention"
          ? "You were mentioned"
          : "New message";
    const subject = `${subjectPrefix} · ${input.subject}`.slice(0, 120);

    await sendViaMailerSend({
      to,
      subject,
      html: buildHtml({
        preview: input.preview,
        actorUsername: input.actorUsername,
        link: input.link,
      }),
      text: buildText({
        preview: input.preview,
        actorUsername: input.actorUsername,
        link: input.link,
      }),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[email] sendAlertEmail failed", err);
  }
}
