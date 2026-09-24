"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { CONSENT_COOKIE, type ConsentChoice } from "@/lib/consent";
import { getCookie, setCookie } from "@/lib/cookies-client";

function readConsent(): ConsentChoice | null {
  const value = getCookie(CONSENT_COOKIE);
  if (value === "accepted" || value === "rejected") return value;
  return null;
}

export function CookieConsent() {
  const { dict } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    if (!stored) setVisible(true);
  }, []);

  function save(choice: ConsentChoice) {
    setCookie(CONSENT_COOKIE, choice, 365);
    setVisible(false);
    window.dispatchEvent(new CustomEvent("its-consent-change", { detail: choice }));
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-ink/10 bg-paper/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-night/95"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="shell flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl text-sm leading-6 text-ink/80 dark:text-cream/85">
          <p id="cookie-consent-title" className="font-semibold text-ink dark:text-cream">
            {dict.cookies.title}
          </p>
          <p id="cookie-consent-desc" className="mt-1">
            {dict.cookies.text}{" "}
            <Link href="/privacy" className="font-medium text-tech underline-offset-2 hover:underline">
              {dict.cookies.privacyLink}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save("rejected")}
            className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium hover:bg-surface dark:border-white/15"
          >
            {dict.cookies.reject}
          </button>
          <button
            type="button"
            onClick={() => save("accepted")}
            className="rounded-full bg-tech px-4 py-2 text-sm font-semibold text-cream"
          >
            {dict.cookies.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
