"use client";

import Image from "next/image";
import Link from "next/link";
import { Navigation, Phone } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { googleMapsPlaceUrl, googleMapsEmbedUrl, officeLocation, STORE_MAP_ID } from "@/lib/maps";
import { site } from "@/lib/site";

export function ContactMap() {
  const { dict } = useLocale();

  return (
    <section
      id={STORE_MAP_ID}
      className="scroll-mt-24 overflow-hidden rounded-[2rem] border border-ink/10 bg-card shadow-lift"
    >
      <div className="relative isolate">
        <div className="relative aspect-[4/3] min-h-[280px] w-full bg-paper sm:aspect-[21/9] sm:min-h-[320px]">
          <iframe
            title={dict.contact.mapTitle}
            src={googleMapsEmbedUrl()}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-paper via-transparent to-transparent"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/10" aria-hidden />

          <p className="sr-only">{officeLocation.label}</p>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
          <div
            className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-ink/10 bg-paper p-4 text-ink shadow-lift sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5"
          >
            <div className="flex min-w-0 items-start gap-3 sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-ink/10 bg-surface p-2">
                <Image
                  src="/its_logo.svg"
                  alt=""
                  width={80}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-tech">{dict.contact.mapTitle}</p>
                <p className="mt-0.5 font-display text-lg leading-snug sm:text-xl">ITS Group</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/80">{site.address}</p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
              <Link
                href={googleMapsPlaceUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-tech-deep"
              >
                <Navigation className="h-4 w-4" aria-hidden />
                {dict.contact.openInMaps}
              </Link>
              <Link
                href={site.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/10 bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-tech hover:text-tech"
              >
                <Phone className="h-4 w-4" aria-hidden />
                {site.phone}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
