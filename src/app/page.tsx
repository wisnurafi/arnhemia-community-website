import { NavbarServer } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { Pricing } from "@/components/home/pricing";
import { Faq } from "@/components/home/faq";
import { Cta } from "@/components/home/cta";

export default function HomePage() {
  return (
    <>
      <NavbarServer />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
