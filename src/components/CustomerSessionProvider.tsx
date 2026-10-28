"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CustomerPricing } from "@/lib/customers";

export type CustomerHeaderProfile = {
  name: string;
  discountPercent: number | null;
};

type SessionPricingJson = {
  generalDiscountPercent: number | null;
  productDiscounts: Record<string, number>;
};

type SessionResponse = {
  profile: CustomerHeaderProfile | null;
  pricing: SessionPricingJson | null;
};

type CustomerSessionValue = {
  profile: CustomerHeaderProfile | null;
  pricing: CustomerPricing | null;
};

const emptySession: CustomerSessionValue = { profile: null, pricing: null };

const CustomerSessionContext = createContext<CustomerSessionValue>(emptySession);

function toCustomerPricing(pricing: SessionPricingJson | null): CustomerPricing | null {
  if (!pricing) return null;
  return {
    customerId: "",
    generalDiscountPercent: pricing.generalDiscountPercent,
    productDiscounts: new Map(Object.entries(pricing.productDiscounts)),
  };
}

export function CustomerSessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<SessionResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/customer-session")
      .then((response) => (response.ok ? (response.json() as Promise<SessionResponse>) : null))
      .then((payload) => {
        if (!cancelled && payload) setSession(payload);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const value = useMemo<CustomerSessionValue>(
    () => ({
      profile: session?.profile ?? null,
      pricing: toCustomerPricing(session?.pricing ?? null),
    }),
    [session],
  );

  return <CustomerSessionContext.Provider value={value}>{children}</CustomerSessionContext.Provider>;
}

export function useCustomerSession() {
  return useContext(CustomerSessionContext);
}
