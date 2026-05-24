import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";

export default async function ProfileRedirect() {
  const session = await requireSession();
  redirect(`/u/${session.profile.username}`);
}
