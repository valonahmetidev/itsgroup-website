import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminGetCustomer, adminListCustomerProformas } from "@/app/admin/actions";
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
  const data = await adminGetCustomer(id);
  if (!data) notFound();
  const proformas = await adminListCustomerProformas(id);

  return <CustomerEditForm customer={data.customer} discounts={data.discounts} proformas={proformas} />;
}
