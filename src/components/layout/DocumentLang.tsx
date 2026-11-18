"use client";

import { useEffect } from "react";

/** Sets <html lang> for the active public locale (root layout is shared with /admin). */
export function DocumentLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
