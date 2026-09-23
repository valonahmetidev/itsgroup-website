import type { Metadata } from "next";
import { ProductSearch } from "@/components/admin/ProductSearch";
import { categories, productsInCategory } from "@/lib/catalog";
import { getServerI18n } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Admin products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const { dict } = await getServerI18n();
  const adminCategories = categories
    .filter((category) => productsInCategory(category.source, category.id).length > 0)
    .map((category) => ({
      source: category.source,
      slug: category.slug,
      name: category.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "mk"));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl">{dict.admin.products}</h2>
        <p className="mt-2 text-ink/60">{dict.admin.productsText}</p>
      </div>
      <ProductSearch categories={adminCategories} />
    </div>
  );
}
