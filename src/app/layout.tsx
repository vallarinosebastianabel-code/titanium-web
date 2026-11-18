import type { Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#002f49",
};

/** Root wraps public `[locale]` pages and `/admin`. `lang` is set in `[locale]/layout`. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html suppressHydrationWarning className={`${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans text-navy-900">{children}</body>
    </html>
  );
}
