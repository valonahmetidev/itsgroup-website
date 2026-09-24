"use client";

import Script from "next/script";
import { useEffect } from "react";
import { CONSENT_COOKIE, type ConsentChoice } from "@/lib/consent";
import { getCookie } from "@/lib/cookies-client";

function readGaId() {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
}

function readConsentChoice(): ConsentChoice | null {
  const value = getCookie(CONSENT_COOKIE);
  return value === "accepted" || value === "rejected" ? value : null;
}

function applyConsentToGtag(choice: ConsentChoice | null) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  if (choice === "accepted") {
    window.gtag("consent", "update", {
      analytics_storage: "granted",
    });
    return;
  }

  if (choice === "rejected") {
    window.gtag("consent", "update", {
      analytics_storage: "denied",
    });
  }
}

function syncConsentFromCookie() {
  applyConsentToGtag(readConsentChoice());
}

export function Analytics() {
  const gaId = readGaId();

  useEffect(() => {
    syncConsentFromCookie();
    window.addEventListener("its-consent-change", syncConsentFromCookie);
    return () => window.removeEventListener("its-consent-change", syncConsentFromCookie);
  }, []);

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
            wait_for_update: 500
          });
        `}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
