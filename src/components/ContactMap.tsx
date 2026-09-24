"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { googleMapsEmbedUrl, googleMapsPlaceUrl, officeLocation, STORE_MAP_ID } from "@/lib/maps";
import { site } from "@/lib/site";

export function ContactMap() {
  const { dict } = useLocale();

  return (
    <section
      id={STORE_MAP_ID}
      className="scroll-mt-24 overflow-hidden rounded-3xl border border-tech/25 bg-card shadow-lift"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-gradient-to-r from-tech-deep via-[#143f36] to-tech px-5 py-4 text-cream">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/70">{dict.contact.mapTitle}</p>
          <p className="mt-1 font-display text-xl leading-snug">{site.address}</p>
        </div>
        <Link
          href={googleMapsPlaceUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-cream/15 px-4 py-2 text-sm font-semibold text-cream transition hover:bg-cream/25"
        >
          <MapPin className="h-4 w-4" aria-hidden />
          {dict.contact.openInMaps}
        </Link>
      </div>

      <div className="relative aspect-[16/9] min-h-[260px] w-full bg-[#0b1f1a] sm:aspect-[21/9]">
        <iframe
          title={dict.contact.mapTitle}
          src={googleMapsEmbedUrl()}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-tech/20"
          aria-hidden
        />
        <p className="sr-only">{officeLocation.label}</p>
      </div>
    </section>
  );
}
