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
    <div className="overflow-x-auto rounded-2xl border border-ink/10">
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
  );
}
