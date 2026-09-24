"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_COOKIE, type ConsentChoice } from "@/lib/consent";
import { getCookie } from "@/lib/cookies-client";

function readConsentChoice(): ConsentChoice | null {
  const value = getCookie(CONSENT_COOKIE);
  return value === "accepted" || value === "rejected" ? value : null;
}

function grantAnalyticsStorage() {
  if (typeof window.gtag !== "function") return false;
  window.gtag("consent", "update", { analytics_storage: "granted" });
  return true;
}

export function Analytics({ gaId }: { gaId: string }) {
  const [consent, setConsent] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    function sync() {
      setConsent(readConsentChoice());
    }
    sync();
    window.addEventListener("its-consent-change", sync);
    return () => window.removeEventListener("its-consent-change", sync);
  }, []);

  useEffect(() => {
    if (consent !== "accepted") return;

    if (grantAnalyticsStorage()) return;

    const interval = window.setInterval(() => {
      if (grantAnalyticsStorage()) window.clearInterval(interval);
    }, 50);
    return () => window.clearInterval(interval);
  }, [consent]);

  if (!gaId) return null;

  return (
    <>
      <Script id="ga-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 2000
          });
        `}
      </Script>
      {consent === "accepted" ? <GoogleAnalytics gaId={gaId} /> : null}
    </>
  );
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
