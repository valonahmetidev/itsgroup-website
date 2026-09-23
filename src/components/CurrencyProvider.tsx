"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  CURRENCY_COOKIE,
  formatPriceWithCurrency,
  isDisplayCurrency,
  type DisplayCurrency,
  type ExchangeRateSnapshot,
} from "@/lib/currency";
import { useLocale } from "@/components/LocaleProvider";
import { writePreferenceCookie } from "@/lib/cookies";

type CurrencyContextValue = {
  currency: DisplayCurrency;
  rates: ExchangeRateSnapshot;
  setCurrency: (currency: DisplayCurrency) => void;
  formatPrice: (amountMkd: number | null) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readCookieCurrency(): DisplayCurrency {
  if (typeof document === "undefined") return "MKD";
  const match = document.cookie.match(new RegExp(`(?:^|; )${CURRENCY_COOKIE}=([^;]*)`));
  const value = match?.[1];
  return value && isDisplayCurrency(value) ? value : "MKD";
}

export function CurrencyProvider({
  children,
  initialCurrency,
  initialRates,
}: {
  children: React.ReactNode;
  initialCurrency: DisplayCurrency;
  initialRates: ExchangeRateSnapshot;
}) {
  const { locale, dict } = useLocale();
  const [currency, setCurrencyState] = useState<DisplayCurrency>(initialCurrency);
  const [rates, setRates] = useState<ExchangeRateSnapshot>(initialRates);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCurrencyState(readCookieCurrency());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writePreferenceCookie(CURRENCY_COOKIE, currency);
  }, [currency, ready]);

  useEffect(() => {
    void fetch("/api/exchange-rates")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: ExchangeRateSnapshot | null) => {
        if (payload?.rates?.EUR) setRates(payload);
      })
      .catch(() => undefined);
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      rates,
      setCurrency: setCurrencyState,
      formatPrice: (amountMkd) => formatPriceWithCurrency(amountMkd, locale, currency, rates.rates, dict),
    }),
    [currency, rates, locale, dict],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error("useCurrency must be used within CurrencyProvider");
  return value;
}
