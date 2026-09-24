import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductSearch } from "@/components/admin/ProductSearch";
import { adminCategoryPickerOptions } from "@/app/admin/actions";
import { getServerI18n } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Admin products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ edited?: string }>;
}) {
  const { edited } = await searchParams;
  const editedOnly = edited === "1" || edited === "true";
  const { dict } = await getServerI18n();
  const adminCategories = await adminCategoryPickerOptions("all");

  return (
    <div className="space-y-4">
      <AdminPageHeader title={dict.admin.products} description={dict.admin.productsText} />
      <ProductSearch categories={adminCategories} initialEditedOnly={editedOnly} />
    </div>
  );
}
