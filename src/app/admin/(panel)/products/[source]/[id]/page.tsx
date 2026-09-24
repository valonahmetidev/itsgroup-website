import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminGetCategoryMenu, adminGetProduct, adminGetStoreProduct } from "@/app/admin/actions";
import { flattenAdminCategoryMenu } from "@/lib/admin-category-menu";
import { ProductEditForm } from "@/components/admin/ProductEditForm";
import { StoreProductForm } from "@/components/admin/StoreProductForm";
import { isCatalogSource, isSource } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ source: string; id: string }>;
}) {
  const { source, id } = await params;
  if (!isSource(source)) notFound();

  if (source === "its") {
    if (id === "new") {
      return <StoreProductForm />;
    }
    const data = await adminGetStoreProduct(id);
    if (!data) notFound();
    return <StoreProductForm row={data.row} />;
  }

  if (!isCatalogSource(source)) notFound();

  const data = await adminGetProduct(source, id);
  if (!data) notFound();

  const categoryOptions = flattenAdminCategoryMenu(await adminGetCategoryMenu(source)).map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <ProductEditForm
      product={data.product}
      override={data.override}
      categoryOptions={categoryOptions}
      assignedCategoryId={data.categoryAssignment ?? data.effective?.categories[0]?.id ?? null}
    />
  );
}
