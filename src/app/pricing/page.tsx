import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Pricing } from "@/components/home/pricing";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <NavbarServer />
      <main>
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
