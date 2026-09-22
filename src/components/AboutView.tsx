"use client";

import { PageHeader } from "@/components/PageHeader";
import { useLocale } from "@/components/LocaleProvider";
import { fetchedAt, counts } from "@/lib/catalog";
import { fill } from "@/lib/i18n";
import { formatCount, formatDate } from "@/lib/format";

export function AboutView() {
  const { dict, locale } = useLocale();
  const totals = counts();

  return (
    <>
      <PageHeader eyebrow={dict.about.eyebrow} title={dict.about.heading} text={dict.about.text} />
      <div className="shell grid gap-6 pb-8 md:grid-cols-3">
        <article className="rounded-3xl bg-tech-deep p-6 text-cream md:col-span-2">
          <h2 className="font-display text-3xl">{dict.about.inside}</h2>
          <p className="mt-4 leading-7 text-cream/80">
            {fill(dict.about.insideBody, { tech: formatCount(totals.treco), home: formatCount(totals.tremark) })}
          </p>
          <p className="mt-4 leading-7 text-cream/80">
            {fill(dict.about.updated, { date: formatDate(fetchedAt, locale) })}
          </p>
        </article>
        <article className="rounded-3xl border border-ink/10 bg-card p-6">
          <h2 className="font-display text-3xl">{dict.about.quoteTitle}</h2>
          <p className="mt-4 leading-7 text-ink/70">{dict.about.quoteBody}</p>
        </article>
      </div>
    </>
  );
}
