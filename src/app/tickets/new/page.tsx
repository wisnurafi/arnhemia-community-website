import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { requireSession } from "@/lib/auth";
import { NewTicketView } from "./view";

export const metadata = { title: "Open ticket" };

export default async function NewTicketPage() {
  await requireSession();
  return (
    <>
      <NavbarServer />
      <NewTicketView />
      <Footer />
    </>
  );
}
