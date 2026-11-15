import type { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { ProductPreview } from "@/components/landing/product-preview";
import { Compare } from "@/components/landing/compare";
import { Features } from "@/components/landing/features";
import { Steps } from "@/components/landing/steps";
import { Integrations } from "@/components/landing/integrations";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: { absolute: "Orvalot — Ajanslar için performans raporlama" },
  description:
    "Orvalot; Meta, Google ve e-ticaret verilerini her gün tek bir panelde toplar. Ajanslar tüm markaları bir bakışta görür, müşteriler kendi panellerini ay sonunu beklemeden açar.",
};

export default function LandingPage() {
  return (
    <>
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-surface focus:px-3 focus:py-2 focus:text-body focus:text-fg"
      >
        İçeriğe geç
      </a>
      <Header />
      <main id="icerik">
        <Hero />
        <section aria-label="Ürün önizlemesi" className="px-4 pb-4 md:px-6">
          <ProductPreview />
        </section>
        <Compare />
        <Features />
        <Steps />
        <Integrations />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
