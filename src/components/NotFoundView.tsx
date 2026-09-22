"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

export function NotFoundView() {
  const { dict } = useLocale();

  return (
    <div className="shell py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tech">404</p>
      <h1 className="mt-3 font-display text-5xl">{dict.notFound.title}</h1>
      <Link href="/katalog" className="mt-6 inline-block font-semibold text-tech">
        {dict.notFound.catalog}
      </Link>
    </div>
  );
}
