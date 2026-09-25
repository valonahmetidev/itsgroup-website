import { notFound, redirect } from "next/navigation";
import { customerGetProformaForDownload } from "@/app/customer/actions";
import { CustomerProformaEditor } from "@/components/CustomerProformaEditor";
import { getCustomerProfile } from "@/lib/customer-profile";
import { createPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata() {
  return createPageMetadata("profile");
}

export const dynamic = "force-dynamic";

export default async function CustomerProformaEditPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCustomerProfile();
  if (!profile) redirect("/najava");

  const { id } = await params;
  const result = await customerGetProformaForDownload(id);
  if (!result.ok) notFound();

  return (
    <CustomerProformaEditor
      proformaId={id}
      documentNo={result.documentNo}
      createdAt={result.createdAt}
      initialPayload={result.payload}
    />
  );
}
