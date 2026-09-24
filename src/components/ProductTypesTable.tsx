"use client";

import { useLocale } from "@/components/LocaleProvider";
import { formatTypesCount } from "@/lib/format";
import type { ProductType } from "@/lib/types";

export function ProductTypesTable({ types }: { types: ProductType[] }) {
  const { dict } = useLocale();

  return (
    <section className="mt-6 min-w-0 sm:mt-8">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2 sm:mb-4 sm:gap-3">
        <h2 className="font-display text-xl sm:text-2xl">{dict.product.typesHeading}</h2>
        <p className="text-xs text-ink/50 sm:text-sm">{formatTypesCount(types.length, dict)}</p>
      </div>

      <ul className="space-y-2 sm:hidden">
        {types.map((type) => (
          <li key={type.id} className="rounded-2xl border border-ink/10 bg-surface/40 p-3">
            <p className="font-medium leading-snug">{type.name}</p>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <div>
                <dt className="text-ink/45">{dict.product.typeDiameter}</dt>
                <dd className="mt-0.5 font-mono text-ink/75">{type.cableDiameterMm ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-ink/45">{dict.product.typeWeight}</dt>
                <dd className="mt-0.5 font-mono text-ink/75">{type.weightKgPerKm ?? "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-ink/45">{dict.product.typePackaging}</dt>
                <dd className="mt-0.5 font-mono text-ink/75">{type.packagingM ?? "—"}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-2xl border border-ink/10 sm:block sm:rounded-3xl">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface/80 text-xs uppercase tracking-[0.12em] text-ink/45">
            <tr>
              <th className="px-3 py-2.5 font-semibold sm:px-4 sm:py-3">{dict.product.typeSize}</th>
              <th className="px-3 py-2.5 font-semibold sm:px-4 sm:py-3">{dict.product.typeDiameter}</th>
              <th className="px-3 py-2.5 font-semibold sm:px-4 sm:py-3">{dict.product.typeWeight}</th>
              <th className="px-3 py-2.5 font-semibold sm:px-4 sm:py-3">{dict.product.typePackaging}</th>
            </tr>
          </thead>
          <tbody>
            {types.map((type) => (
              <tr key={type.id} className="border-t border-ink/8">
                <td className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">{type.name}</td>
                <td className="px-3 py-2.5 font-mono text-ink/70 sm:px-4 sm:py-3">{type.cableDiameterMm ?? "—"}</td>
                <td className="px-3 py-2.5 font-mono text-ink/70 sm:px-4 sm:py-3">{type.weightKgPerKm ?? "—"}</td>
                <td className="px-3 py-2.5 font-mono text-ink/70 sm:px-4 sm:py-3">{type.packagingM ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-ink/45 sm:mt-3">{dict.product.typesNote}</p>
    </section>
  );
}
