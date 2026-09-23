import type { DisplayCurrency, ExchangeRateSnapshot } from "@/lib/currency";

const TARGETS: DisplayCurrency[] = ["EUR", "USD", "CHF"];

/** Approximate fallback when the rates API is unavailable. */
const FALLBACK_RATES: ExchangeRateSnapshot = {
  base: "MKD",
  updatedAt: "fallback",
  rates: {
    MKD: 1,
    EUR: 0.01625,
    USD: 0.01785,
    CHF: 0.01538,
  },
};

let memoryCache: { snapshot: ExchangeRateSnapshot; expiresAt: number } | null = null;

function snapshotFromApi(payload: {
  time_last_update_utc?: string;
  rates?: Partial<Record<DisplayCurrency, number>>;
}): ExchangeRateSnapshot | null {
  const rates = payload.rates;
  if (!rates?.EUR || !rates?.USD || !rates?.CHF) return null;

  return {
    base: "MKD",
    updatedAt: payload.time_last_update_utc ?? new Date().toISOString(),
    rates: {
      MKD: 1,
      EUR: rates.EUR,
      USD: rates.USD,
      CHF: rates.CHF,
    },
  };
}

export async function getExchangeRates(): Promise<ExchangeRateSnapshot> {
  if (memoryCache && Date.now() < memoryCache.expiresAt) {
    return memoryCache.snapshot;
  }

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/MKD", {
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error("rates request failed");

    const payload = (await response.json()) as {
      result?: string;
      time_last_update_utc?: string;
      rates?: Partial<Record<DisplayCurrency, number>>;
    };

    if (payload.result !== "success") throw new Error("rates payload invalid");

    const snapshot = snapshotFromApi(payload);
    if (!snapshot) throw new Error("rates incomplete");

    memoryCache = { snapshot, expiresAt: Date.now() + 3_600_000 };
    return snapshot;
  } catch {
    return FALLBACK_RATES;
  }
}
