import type { Metadata } from "next";
import Link from "next/link";
import { adminListStoreProducts } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
    <div className="space-y-4">
      <AdminPageHeader
        title={dict.admin.custom}
        description={dict.admin.customText}
        actions={
          <Link
            href="/admin/products/its/new"
            className="rounded-full bg-tech px-4 py-1.5 text-sm font-semibold text-cream"
          >
            {dict.admin.addCustom}
          </Link>
        }
      />

      {products.length === 0 ? (
        <p className="text-ink/60">{dict.admin.noCustom}</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/its/${product.id}`}
              className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-card p-2.5 transition hover:border-tech"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                {product.image_url ? (
                  <CatalogImage src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain p-1" />
                ) : (
                  <span className="px-1 text-center text-[9px] uppercase tracking-wide text-ink/35">{dict.admin.noImage}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium leading-snug">{product.name_mk || product.name}</p>
                <p className="mt-0.5 text-xs text-ink/55">{formatPrice(product.price, locale, dict)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
