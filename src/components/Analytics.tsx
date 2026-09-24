"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_COOKIE, type ConsentChoice } from "@/lib/consent";
import { getCookie } from "@/lib/cookies-client";

function readGaId() {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
}

export function Analytics() {
  const gaId = readGaId();
  const [consent, setConsent] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    function sync() {
      const value = getCookie(CONSENT_COOKIE);
      setConsent(value === "accepted" || value === "rejected" ? value : null);
    }
    sync();
    window.addEventListener("its-consent-change", sync);
    return () => window.removeEventListener("its-consent-change", sync);
  }, []);

  if (!gaId || consent !== "accepted") return null;

  return (
    <>
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
