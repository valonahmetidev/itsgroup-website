import { adminListCustomers } from "@/app/admin/actions";
import { ProformaEditor } from "@/components/admin/ProformaEditor";

export const metadata = {
  title: "New proforma",
  robots: { index: false, follow: false },
};

export default async function AdminNewProformaPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer: customerId } = await searchParams;
  const customers = await adminListCustomers();
  const presetCustomer = customerId ? customers.find((row) => row.id === customerId) ?? null : null;

  return (
    <ProformaEditor
      initial={null}
      customers={customers}
      presetCustomerId={customerId}
      presetCustomer={presetCustomer}
      backHref={customerId ? `/admin/customers/${customerId}` : "/admin/proformas"}
    />
  );
}
