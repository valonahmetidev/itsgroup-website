"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { categoryDisplayName } from "@/lib/i18n/catalog-labels";
import type { Source } from "@/lib/types";

export type TickerItem = {
  title: string;
  href: string;
  source: Source;
  slug: string;
};

export function HomeTicker({ items }: { items: TickerItem[] }) {
  const { dict, locale } = useLocale();
  const track = [...items, ...items];

  return (
    <div className="relative shrink-0 overflow-hidden border-t border-ink/10 bg-surface/60">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-12 bg-gradient-to-r from-surface/95 to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-12 bg-gradient-to-l from-surface/95 to-transparent sm:w-24" />
      <div className="marquee flex w-max items-center gap-8 py-4 text-xs font-medium sm:gap-12 sm:py-6 sm:text-base">
        {track.map((item, index) => (
          <Link
            key={`${item.href}-${index}`}
            href={item.href}
            className="shrink-0 text-ink/60 transition hover:text-tech"
          >
            {categoryDisplayName(item, locale)}
          </Link>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-start pl-4 sm:justify-center sm:pl-0">
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper/95 px-2.5 py-1 shadow-sm backdrop-blur-md sm:gap-3 sm:px-5 sm:py-2.5">
          <Link
            href="/tehnologija"
            className="rounded-md px-1.5 py-0.5 font-display text-[11px] font-semibold leading-none text-tech transition hover:opacity-80 sm:rounded-lg sm:px-2 sm:py-1 sm:text-lg"
          >
            {dict.nav.technology}
          </Link>
          <span className="h-3 w-px bg-ink/15 sm:h-5" aria-hidden />
          <Link
            href="/dom"
            className="rounded-md px-1.5 py-0.5 font-display text-[11px] font-semibold leading-none text-home transition hover:opacity-80 sm:rounded-lg sm:px-2 sm:py-1 sm:text-lg"
          >
            {dict.nav.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
