"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminMarkInquiryRead } from "@/app/admin/actions";
import { useLocale } from "@/components/LocaleProvider";
import type { InquiryRow } from "@/lib/inquiries";

type QuotePayload = {
  items?: Array<{ name: string; quantity: number; unit: string; price: number | null }>;
  total?: number | null;
};

export function InquiryDetail({ inquiry }: { inquiry: InquiryRow }) {
  const router = useRouter();
  const { dict, locale } = useLocale();
  const [loading, setLoading] = useState(false);

  let quotePayload: QuotePayload | null = null;
  if (inquiry.payload_json) {
    try {
      quotePayload = JSON.parse(inquiry.payload_json) as QuotePayload;
    } catch {
      quotePayload = null;
    }
  }

  async function markRead() {
    setLoading(true);
    await adminMarkInquiryRead(inquiry.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Link href="/admin/inquiries" className="text-sm font-semibold text-tech hover:underline">
        ← {dict.admin.inquiries}
      </Link>
      <div className="rounded-2xl border border-ink/10 bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              {inquiry.type === "contact" ? dict.admin.inquiryTypeContact : dict.admin.inquiryTypeQuote}
            </p>
            <h1 className="mt-1 font-display text-2xl">{inquiry.name}</h1>
            <p className="mt-2 text-sm text-ink/60">
              {new Date(inquiry.created_at).toLocaleString(locale)} ·{" "}
              {inquiry.status === "new" ? dict.admin.inquiryStatusNew : dict.admin.inquiryStatusRead}
            </p>
          </div>
          {inquiry.status === "new" && (
            <button
              type="button"
              disabled={loading}
              onClick={() => void markRead()}
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-40"
            >
              {dict.admin.inquiryMarkRead}
            </button>
          )}
        </div>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          {inquiry.email && (
            <div>
              <dt className="text-ink/50">{dict.admin.customerEmail}</dt>
              <dd className="font-medium">{inquiry.email}</dd>
            </div>
          )}
          {inquiry.phone && (
            <div>
              <dt className="text-ink/50">{dict.contact.phone}</dt>
              <dd className="font-medium">{inquiry.phone}</dd>
            </div>
          )}
          {inquiry.company && (
            <div>
              <dt className="text-ink/50">{dict.quote.company}</dt>
              <dd className="font-medium">{inquiry.company}</dd>
            </div>
          )}
        </dl>
        {inquiry.message && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{dict.admin.inquiryMessage}</p>
            <p className="mt-2 whitespace-pre-wrap leading-7 text-ink/80">{inquiry.message}</p>
          </div>
        )}
        {quotePayload?.items && quotePayload.items.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{dict.admin.inquiryPayload}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {quotePayload.items.map((line, index) => (
                <li key={index} className="rounded-xl bg-surface/80 px-3 py-2">
                  {line.name} — {line.quantity} {line.unit}
                  {line.price != null ? ` · ${line.price} MKD` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
