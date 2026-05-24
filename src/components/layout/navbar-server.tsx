import Link from "next/link";
import { Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "./navbar";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AlertsPanelServer } from "./alerts-panel-server";
import { ConversationsPanelServer } from "./conversations-panel-server";
import { RealtimeRefresh } from "./realtime-refresh";

export async function NavbarServer() {
  const session = await getSession();

  if (!session) {
    return (
      <Navbar
        profile={null}
        authSlot={
          <div className="hidden items-center gap-2 sm:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Apply</Link>
            </Button>
          </div>
        }
      />
    );
  }

  // Unread badge counts (lightweight head-only queries).
  const supabase = await createClient();
  const { count: unreadAlerts } = await supabase
    .from("alerts")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", session.id)
    .is("read_at", null);

  return (
    <>
      <Navbar
        profile={session.profile}
        unreadAlerts={unreadAlerts ?? 0}
        conversationsSlot={
          <ConversationsPanelServer>
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="size-[18px]" />
            </Button>
          </ConversationsPanelServer>
        }
        alertsSlot={
          <AlertsPanelServer>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-[18px]" />
              {unreadAlerts && unreadAlerts > 0 ? (
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-white ring-2 ring-background" />
              ) : null}
            </Button>
          </AlertsPanelServer>
        }
      />
      {/*
        Refresh the navbar's RSC tree (and therefore the alerts/conversations
        dropdowns + unread badges) whenever a relevant row changes for this
        user. Because every DM also fans out as an alert with kind="message",
        listening to alerts alone covers both the lonceng and the conversations
        dropdown.
      */}
      <RealtimeRefresh
        channel={`navbar:${session.id}`}
        subscriptions={[
          {
            table: "alerts",
            event: "*",
            filter: `recipient_id=eq.${session.id}`,
          },
        ]}
      />
    </>
  );
}
