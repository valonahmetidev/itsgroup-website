"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
import { CONSENT_COOKIE, type ConsentChoice } from "@/lib/consent";
import { getCookie } from "@/lib/cookies-client";

function readGaId() {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
}

function readConsentChoice(): ConsentChoice | null {
  const value = getCookie(CONSENT_COOKIE);
  return value === "accepted" || value === "rejected" ? value : null;
}

function gtagReady() {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

function grantAnalytics(gaId: string) {
  window.gtag!("consent", "update", {
    analytics_storage: "granted",
  });
  window.gtag!("config", gaId, {
    anonymize_ip: true,
    send_page_view: true,
    page_location: window.location.href,
    page_title: document.title,
  });
}

function denyAnalytics() {
  window.gtag!("consent", "update", {
    analytics_storage: "denied",
  });
}

export function Analytics() {
  const gaId = readGaId();
  const appliedChoiceRef = useRef<ConsentChoice | null>(null);

  const syncConsent = useCallback(() => {
    if (!gaId || !gtagReady()) return false;

    const choice = readConsentChoice();
    if (choice === appliedChoiceRef.current) return true;

    if (choice === "accepted") {
      grantAnalytics(gaId);
      appliedChoiceRef.current = "accepted";
      return true;
    }

    if (choice === "rejected") {
      denyAnalytics();
      appliedChoiceRef.current = "rejected";
      return true;
    }

    return true;
  }, [gaId]);

  useEffect(() => {
    if (!gaId) return;

    function onConsentChange() {
      appliedChoiceRef.current = null;
      syncConsent();
    }

    if (syncConsent()) {
      window.addEventListener("its-consent-change", onConsentChange);
      return () => window.removeEventListener("its-consent-change", onConsentChange);
    }

    const interval = window.setInterval(() => {
      if (syncConsent()) window.clearInterval(interval);
    }, 100);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 15_000);

    window.addEventListener("its-consent-change", onConsentChange);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      window.removeEventListener("its-consent-change", onConsentChange);
    };
  }, [gaId, syncConsent]);

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
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
        onLoad={() => {
          appliedChoiceRef.current = null;
          syncConsent();
        }}
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
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
