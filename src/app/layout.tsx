import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { getSiteConfig } from "@/services/dataService";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { business } = await getSiteConfig();
  const description =
    "Financiamiento propio sin SSN (Social) en Hollywood, FL. Pasaporte, licencia, título limpio e inicial clara. Escribime a Sebastián por WhatsApp.";
  return {
    title: {
      default: `${business.name} | ${business.tagline.replace(/\.$/, "")}`,
      template: `%s | ${business.name}`,
    },
    description,
    openGraph: {
      title: `${business.name} | ${business.tagline.replace(/\.$/, "")}`,
      description,
      type: "website",
      locale: "es_US",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#002f49",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans text-navy-900">{children}</body>
    </html>
  );
}
