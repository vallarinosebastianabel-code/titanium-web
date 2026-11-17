import { AboutSection } from "@/components/sections/about/AboutSection";
import { CatalogSection } from "@/components/sections/catalog/CatalogSection";
import { ContactSection } from "@/components/sections/contact/ContactSection";
import { FaqSection } from "@/components/sections/faq/FaqSection";
import { Hero } from "@/components/sections/hero/Hero";
import { FinancingSection } from "@/components/sections/loan/FinancingSection";
import { HowItWorks } from "@/components/sections/process/HowItWorks";
import { getFaqs, getFeaturedVehicles, getSiteConfig, getVehicleSearchIndex } from "@/services/dataService";

export const revalidate = 300;

export default async function HomePage() {
  const [site, featured, faqs, searchIndex] = await Promise.all([
    getSiteConfig(),
    getFeaturedVehicles(6),
    getFaqs(),
    getVehicleSearchIndex(),
  ]);

  const currency = { locale: site.locale.code, currency: site.locale.currency };

  return (
    <>
      <Hero hero={site.hero} business={site.business} />
      <HowItWorks business={site.business} />
      <CatalogSection
        vehicles={featured}
        searchIndex={searchIndex}
        currency={currency} loan={site.loan} whatsapp={site.business.whatsapp} />
      <FinancingSection loan={site.loan} currency={currency} whatsapp={site.business.whatsapp} />
      <AboutSection business={site.business} />
      <FaqSection faqs={faqs} whatsapp={site.business.whatsapp} />
      <ContactSection business={site.business} />
    </>
  );
}
