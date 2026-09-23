import type { Metadata } from "next";
import Link from "next/link";
import { adminListStoreProducts } from "@/app/admin/actions";
import { CatalogImage } from "@/components/CatalogImage";
import { getServerI18n } from "@/lib/i18n/server";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "ITS products",
  robots: { index: false, follow: false },
};

export default async function AdminCustomPage() {
  const { dict, locale } = await getServerI18n();
  const products = await adminListStoreProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">{dict.admin.custom}</h2>
          <p className="mt-2 text-ink/60">{dict.admin.customText}</p>
        </div>
        <Link
          href="/admin/products/its/new"
          className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream"
        >
          {dict.admin.addCustom}
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-ink/60">{dict.admin.noCustom}</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/its/${product.id}`}
              className="flex gap-4 rounded-3xl border border-ink/10 bg-card p-3 transition hover:border-tech"
            >
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
                {product.image_url ? (
                  <CatalogImage src={product.image_url} alt={product.name} className="h-full w-full object-contain p-2" />
                ) : (
                  <span className="px-2 text-center text-[10px] uppercase tracking-wide text-ink/35">{dict.admin.noImage}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 font-medium">{product.name_mk || product.name}</p>
                <p className="mt-2 text-sm text-ink/55">{formatPrice(product.price, locale, dict)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
