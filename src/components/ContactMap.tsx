"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { googleMapsSearchUrl, openStreetMapEmbedUrl, officeLocation } from "@/lib/maps";
import { site } from "@/lib/site";

export function ContactMap() {
  const { dict } = useLocale();

  return (
    <section className="overflow-hidden rounded-3xl border border-tech/25 bg-card shadow-lift">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-gradient-to-r from-tech-deep via-[#143f36] to-tech px-5 py-4 text-cream">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/70">{dict.contact.mapTitle}</p>
          <p className="mt-1 font-display text-xl leading-snug">{site.address}</p>
        </div>
        <Link
          href={googleMapsSearchUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-cream/15 px-4 py-2 text-sm font-semibold text-cream transition hover:bg-cream/25"
        >
          <MapPin className="h-4 w-4" aria-hidden />
          {dict.contact.openInMaps}
        </Link>
      </div>

      <div className="relative aspect-[16/9] min-h-[240px] w-full bg-[#0b1f1a] sm:aspect-[21/9]">
        <iframe
          title={dict.contact.mapTitle}
          src={openStreetMapEmbedUrl()}
          className="absolute inset-0 h-full w-full border-0 opacity-[0.92] contrast-[1.05] saturate-[0.85]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-tech-deep/35 via-transparent to-tech/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-[calc(50%+10px)]"
          aria-hidden
        >
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-tech text-xs font-bold text-cream shadow-[0_8px_24px_rgba(15,110,86,0.55)] ring-4 ring-cream/90">
            ITS
          </span>
          <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1 rotate-45 bg-tech ring-2 ring-cream/90" />
        </div>
        <p className="sr-only">{officeLocation.label}</p>
      </div>
    </section>
  );
}
