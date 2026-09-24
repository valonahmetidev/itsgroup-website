"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

export function NotFoundView() {
  const { dict } = useLocale();

  return (
    <div className="shell py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tech">404</p>
      <h1 className="mt-3 font-display text-5xl">{dict.notFound.title}</h1>
      <p className="mt-4 max-w-xl text-lg text-ink/70">{dict.notFound.text}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream transition hover:opacity-90"
        >
          {dict.notFound.home}
        </Link>
        <Link
          href="/katalog"
          className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold transition hover:border-tech"
        >
          {dict.notFound.catalog}
        </Link>
        <Link
          href="/kontakt"
          className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold transition hover:border-tech"
        >
          {dict.notFound.contact}
        </Link>
      </div>
    </div>
  );
}
