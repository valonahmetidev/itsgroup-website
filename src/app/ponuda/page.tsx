"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { useInquiry } from "@/components/Inquiry";
import { formatPrice } from "@/lib/format";
import { productHref } from "@/lib/paths";

export default function QuotePage() {
  const { items, messages, removeItem, clearItems } = useInquiry();
  const { dict, locale } = useLocale();

  return (
    <div className="shell py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tech">{dict.quote.title}</p>
      <h1 className="mt-3 font-display text-5xl">{dict.quote.heading}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/70">{dict.quote.text}</p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-ink/15 px-6 py-16 text-center">
          <p>{dict.quote.empty}</p>
          <Link href="/katalog" className="mt-4 inline-block font-semibold text-tech">
            {dict.quote.openCatalog}
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {items.map((item) => (
            <article key={item.key} className="flex flex-wrap items-center gap-4 rounded-3xl border border-ink/10 bg-card p-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs text-ink/30">ITS</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={productHref(item)} className="font-medium hover:text-tech">
                  {item.name}
                </Link>
                <p className="text-sm text-ink/55">{formatPrice(item.price, locale, dict)}</p>
              </div>
              <button type="button" onClick={() => removeItem(item.key)} className="text-sm text-ink/50 hover:text-home">
                {dict.quote.remove}
              </button>
            </article>
          ))}
          <button type="button" onClick={clearItems} className="text-sm font-semibold text-ink/50">
            {dict.quote.clear}
          </button>
        </div>
      )}

      {messages.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-3xl">{dict.quote.messages}</h2>
          <div className="mt-4 space-y-3">
            {messages.map((message) => (
              <article key={message.id} className="rounded-3xl bg-card p-5">
                <p className="font-semibold">{message.name}</p>
                <p className="text-sm text-ink/50">{[message.phone, message.email].filter(Boolean).join(" · ")}</p>
                <p className="mt-2 leading-6">{message.message}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
