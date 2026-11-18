import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { DocumentLang } from "@/components/layout/DocumentLang";
import { routing } from "@/i18n/routing";
import { getSiteConfig } from "@/services/dataService";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const ogLocale: Record<string, string> = {
  es: "es_US",
  en: "en_US",
  pt: "pt_BR",
  ht: "ht_HT",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const { business } = await getSiteConfig();
  return {
    title: {
      default: t("titleDefault"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    openGraph: {
      title: t("titleDefault"),
      description: t("description"),
      type: "website",
      locale: ogLocale[locale] ?? "es_US",
      siteName: business.name,
    },
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <DocumentLang locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
