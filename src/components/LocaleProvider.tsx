"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>("mk");

  useEffect(() => {
    const cookieLocale = readCookieLocale();
    setLocaleState(cookieLocale);
    document.documentElement.lang = cookieLocale;
  }, []);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState((current) => {
        if (current === next) return current;
        writePreferenceCookie(LOCALE_COOKIE, next);
        document.documentElement.lang = next;
        router.refresh();
        return next;
      });
    },
    [router],
  );

  const value = useMemo(
    () => ({
      locale,
      dict: getDictionary(locale),
      setLocale,
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used within LocaleProvider");
  return value;
}
