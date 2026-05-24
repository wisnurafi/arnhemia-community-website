import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { Shoutbox, type ShoutItem } from "./shoutbox";

export async function ShoutboxServer() {
  const supabase = await createClient();
  const session = await getSession();

  const { data } = await supabase
    .from("shouts")
    .select(
      "id, body, created_at, user:profiles!shouts_user_id_fkey(id, username, avatar_url, role)",
    )
    .order("created_at", { ascending: false })
    .limit(20);

  const shouts: ShoutItem[] = (data ?? []).map((s) => {
    const u = Array.isArray(s.user) ? s.user[0] : s.user;
    return {
      id: s.id,
      body: s.body,
      created_at: s.created_at,
      user: {
        id: u?.id ?? "",
        username: u?.username ?? "anon",
        avatar_url: u?.avatar_url ?? null,
        role: u?.role ?? "member",
      },
    };
  });

  return <Shoutbox initialShouts={shouts} signedIn={!!session} />;
}
