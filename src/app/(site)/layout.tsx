import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { getSiteConfig } from "@/services/dataService";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteConfig();

  return (
    <>
      <Header business={site.business} />
      <main className="flex-1">{children}</main>
      <Footer business={site.business} />
      <WhatsAppFab business={site.business} />
    </>
  );
}
