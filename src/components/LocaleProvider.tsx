"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getDictionary, isLocale, LOCALE_COOKIE, type Dictionary, type Locale } from "@/lib/i18n";
import { writePreferenceCookie } from "@/lib/cookies";

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readCookieLocale(): Locale {
  if (typeof document === "undefined") return "mk";
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match?.[1];
  return value && isLocale(value) ? value : "mk";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("mk");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(readCookieLocale());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    writePreferenceCookie(LOCALE_COOKIE, locale);
  }, [locale, ready]);

  const value = useMemo(
    () => ({
      locale,
      dict: getDictionary(locale),
      setLocale: setLocaleState,
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used within LocaleProvider");
  return value;
}
