import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Faq as FaqSection } from "@/components/home/faq";

export const metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <>
      <NavbarServer />
      <main>
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
