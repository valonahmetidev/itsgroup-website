import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  adminCustomerDiscountCategoryOptions,
  adminGetCustomer,
  adminListCustomerProformas,
} from "@/app/admin/actions";
import { CustomerEditForm } from "@/components/admin/CustomerEditForm";

export const metadata: Metadata = {
  title: "Edit customer",
  robots: { index: false, follow: false },
};

export default async function AdminCustomerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, proformas, categories] = await Promise.all([
    adminGetCustomer(id),
    adminListCustomerProformas(id),
    adminCustomerDiscountCategoryOptions(),
  ]);
  if (!data) notFound();

  return (
    <CustomerEditForm
      customer={data.customer}
      discounts={data.discounts}
      categoryDiscounts={data.categoryDiscounts}
      categories={categories}
      proformas={proformas}
    />
  );
}
