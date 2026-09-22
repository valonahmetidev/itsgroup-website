"use client";

import Link from "next/link";

export type TickerItem = {
  title: string;
  href: string;
};

export function HomeTicker({ items }: { items: TickerItem[] }) {
  const track = [...items, ...items];

  return (
    <div className="relative shrink-0 overflow-hidden border-t border-ink/10 bg-surface/60">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-16 bg-gradient-to-r from-surface/95 to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-16 bg-gradient-to-l from-surface/95 to-transparent sm:w-24" />
      <div className="marquee flex w-max items-center gap-10 py-6 text-sm font-medium sm:gap-12 sm:py-7 sm:text-base">
        {track.map((item, index) => (
          <Link
            key={`${item.href}-${index}`}
            href={item.href}
            className="shrink-0 text-ink/60 transition hover:text-tech"
          >
            {item.title}
          </Link>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 flex -translate-x-1/2 items-center">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-ink/10 bg-paper/95 px-5 py-2.5 shadow-sm backdrop-blur-md">
          <Link
            href="/tehnologija"
            className="rounded-lg px-2 py-1 font-display text-lg font-semibold leading-none text-tech transition hover:opacity-80"
          >
            Treco
          </Link>
          <span className="h-5 w-px bg-ink/15" aria-hidden />
          <Link
            href="/dom"
            className="rounded-lg px-2 py-1 font-display text-lg font-semibold leading-none text-home transition hover:opacity-80"
          >
            Tremark
          </Link>
        </div>
      </div>
    </div>
  );
}
