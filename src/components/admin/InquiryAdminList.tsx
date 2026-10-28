"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import type { AdminInquirySummary } from "@/app/admin/actions";

export function InquiryAdminList({ items }: { items: AdminInquirySummary[] }) {
  const { dict, locale } = useLocale();

  if (items.length === 0) {
    return <p className="text-sm text-ink/55">{dict.admin.inquiryNoItems}</p>;
  }

  return (
    <>
      <ul className="space-y-2 md:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/admin/inquiries/${item.id}`}
              className="block rounded-2xl border border-ink/10 bg-card p-4 transition hover:border-tech/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{item.name}</p>
                  <p className="mt-1 text-xs text-ink/50">
                    {new Date(item.createdAt).toLocaleString(locale)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink/55">
                  {item.status === "new" ? dict.admin.inquiryStatusNew : dict.admin.inquiryStatusRead}
                </span>
              </div>
              <dl className="mt-3 grid gap-2 text-sm">
                <div>
                  <dt className="text-xs text-ink/45">Type</dt>
                  <dd className="font-medium">
                    {item.type === "contact" ? dict.admin.inquiryTypeContact : dict.admin.inquiryTypeQuote}
                  </dd>
                </div>
                {item.email ? (
                  <div>
                    <dt className="text-xs text-ink/45">{dict.admin.customerEmail}</dt>
                    <dd className="break-all text-ink/75">{item.email}</dd>
                  </div>
                ) : null}
              </dl>
              <p className="mt-3 text-sm font-semibold text-tech">{dict.admin.inquiryView} →</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-2xl border border-ink/10 md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface/80 text-xs uppercase tracking-[0.12em] text-ink/45">
            <tr>
              <th className="px-4 py-3 font-semibold">{dict.admin.inquiryDate}</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">{dict.admin.customerName}</th>
              <th className="px-4 py-3 font-semibold">{dict.admin.customerEmail}</th>
              <th className="px-4 py-3 font-semibold">{dict.admin.proformaStatus}</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-ink/8">
                <td className="px-4 py-3 text-ink/70">{new Date(item.createdAt).toLocaleString(locale)}</td>
                <td className="px-4 py-3">
                  {item.type === "contact" ? dict.admin.inquiryTypeContact : dict.admin.inquiryTypeQuote}
                </td>
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-ink/70">{item.email ?? "—"}</td>
                <td className="px-4 py-3">
                  {item.status === "new" ? dict.admin.inquiryStatusNew : dict.admin.inquiryStatusRead}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/inquiries/${item.id}`} className="font-semibold text-tech hover:underline">
                    {dict.admin.inquiryView}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
