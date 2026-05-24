import Link from "next/link";
import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Save } from "lucide-react";
import { updateAlertPrefsAction } from "../actions";

export const metadata = { title: "Alert preferences" };

export default async function AlertPrefsPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: prefs } = await supabase
    .from("alert_preferences")
    .select("*")
    .eq("user_id", session.id)
    .maybeSingle();

  const v = prefs ?? {
    email_replies: true,
    email_mentions: true,
    email_messages: true,
    push_replies: true,
    push_reactions: true,
    push_mentions: true,
    push_messages: true,
  };

  return (
    <>
      <NavbarServer />
      <main className="container max-w-3xl pb-20 pt-10">
        <Link
          href="/alerts"
          className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to alerts
        </Link>

        <header className="mt-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Notifications
          </span>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-5xl text-gradient-silver">
            Alert preferences
          </h1>
          <p className="mt-3 text-[14px] text-muted-foreground">
            Pick what we&apos;ll bug you about, and how.
          </p>
        </header>

        <form action={updateAlertPrefsAction} className="panel mt-8 p-7 space-y-6">
          <Section title="On-site (push)">
            <Toggle
              name="push_replies"
              label="Replies to my threads"
              defaultChecked={v.push_replies}
            />
            <Toggle
              name="push_reactions"
              label="Reactions on my posts"
              defaultChecked={v.push_reactions}
            />
            <Toggle
              name="push_mentions"
              label="Mentions"
              defaultChecked={v.push_mentions}
            />
            <Toggle
              name="push_messages"
              label="Direct messages"
              defaultChecked={v.push_messages}
            />
          </Section>

          <Section title="Email">
            <Toggle
              name="email_replies"
              label="Replies to my threads"
              defaultChecked={v.email_replies}
            />
            <Toggle
              name="email_mentions"
              label="Mentions"
              defaultChecked={v.email_mentions}
            />
            <Toggle
              name="email_messages"
              label="Direct messages"
              defaultChecked={v.email_messages}
            />
            <p className="text-[11px] text-muted-foreground/80">
              Set your own preference for how often you receive emails.
            </p>
          </Section>

          <div className="flex justify-end">
            <Button type="submit">
              <Save /> Save preferences
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-md border border-white/[0.05] bg-white/[0.02] px-4 py-3">
      <span className="text-[13.5px] text-foreground/90">{label}</span>
      <Checkbox name={name} defaultChecked={defaultChecked} />
    </label>
  );
}
