import { notFound } from "next/navigation";
import { adminGetProforma, adminListCustomers } from "@/app/admin/actions";
import { ProformaEditor } from "@/components/admin/ProformaEditor";

export const metadata = {
  title: "Edit proforma",
  robots: { index: false, follow: false },
};

export default async function AdminEditProformaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proforma = await adminGetProforma(id);
  if (!proforma) notFound();
  const customers = await adminListCustomers();

  return (
    <ProformaEditor
      initial={{
        id: proforma.id,
        documentNo: proforma.documentNo,
        customerId: proforma.customerId,
        status: proforma.status,
        customer: proforma.customer,
        items: proforma.items,
        locale: proforma.locale,
        currency: proforma.currency,
        options: proforma.options,
      }}
      customers={customers}
      backHref={proforma.customerId ? `/admin/customers/${proforma.customerId}` : "/admin/proformas"}
    />
  );
}
