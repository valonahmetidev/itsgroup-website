"use client";

import { useLocale } from "@/components/LocaleProvider";
import { formatTypesCount } from "@/lib/format";
import type { ProductType } from "@/lib/types";

export function ProductTypesTable({ types }: { types: ProductType[] }) {
  const { dict } = useLocale();

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl">{dict.product.typesHeading}</h2>
        <p className="text-sm text-ink/50">{formatTypesCount(types.length, dict)}</p>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-ink/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface/80 text-xs uppercase tracking-[0.12em] text-ink/45">
            <tr>
              <th className="px-4 py-3 font-semibold">{dict.product.typeSize}</th>
              <th className="px-4 py-3 font-semibold">{dict.product.typeDiameter}</th>
              <th className="px-4 py-3 font-semibold">{dict.product.typeWeight}</th>
              <th className="px-4 py-3 font-semibold">{dict.product.typePackaging}</th>
            </tr>
          </thead>
          <tbody>
            {types.map((type) => (
              <tr key={type.id} className="border-t border-ink/8">
                <td className="px-4 py-3 font-medium">{type.name}</td>
                <td className="px-4 py-3 font-mono text-ink/70">{type.cableDiameterMm ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-ink/70">{type.weightKgPerKm ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-ink/70">{type.packagingM ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink/45">{dict.product.typesNote}</p>
    </section>
  );
}
