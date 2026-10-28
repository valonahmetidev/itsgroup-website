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
    <>
      <ul className="space-y-2 md:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/admin/proformas/${item.id}`}
              className="block rounded-2xl border border-ink/10 bg-card p-4 transition hover:border-tech/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{item.documentNo}</p>
                  <p className="mt-1 truncate text-sm text-ink/60">{item.customerName}</p>
                </div>
                <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink/55">
                  {item.status === "sent" ? dict.admin.proformaStatusSent : dict.admin.proformaStatusDraft}
                </span>
              </div>
              <p className="mt-3 font-display text-lg">
                {item.total != null ? formatPrice(item.total, locale, dict) : dict.product.onRequest}
              </p>
              <p className="mt-2 text-sm font-semibold text-tech">{dict.admin.editProforma} →</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-2xl border border-ink/10 md:block">
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
    </>
  );
}
