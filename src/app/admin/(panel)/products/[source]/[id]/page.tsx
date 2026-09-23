import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminGetProduct, adminGetStoreProduct } from "@/app/admin/actions";
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

  return <ProductEditForm product={data.product} override={data.override} />;
}
