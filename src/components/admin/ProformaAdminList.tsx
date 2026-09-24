"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import type { AdminProformaSummary } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";

export function ProformaAdminList({ items }: { items: AdminProformaSummary[] }) {
  const { dict, locale } = useLocale();

  if (items.length === 0) {
    return <p className="text-sm text-ink/55">{dict.admin.proformaNoDocuments}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-surface/80 text-xs uppercase tracking-[0.12em] text-ink/45">
          <tr>
            <th className="px-4 py-3 font-semibold">{dict.admin.proformaDocumentNo}</th>
            <th className="px-4 py-3 font-semibold">{dict.admin.customerName}</th>
            <th className="px-4 py-3 font-semibold">{dict.admin.proformaStatus}</th>
            <th className="px-4 py-3 font-semibold">{dict.quote.productPrice}</th>
            <th className="px-4 py-3 font-semibold" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-ink/8">
              <td className="px-4 py-3 font-medium">{item.documentNo}</td>
              <td className="px-4 py-3 text-ink/70">{item.customerName}</td>
              <td className="px-4 py-3">
                {item.status === "sent" ? dict.admin.proformaStatusSent : dict.admin.proformaStatusDraft}
              </td>
              <td className="px-4 py-3">
                {item.total != null ? formatPrice(item.total, locale, dict) : dict.product.onRequest}
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/proformas/${item.id}`} className="font-semibold text-tech hover:underline">
                  {dict.admin.editProforma}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
