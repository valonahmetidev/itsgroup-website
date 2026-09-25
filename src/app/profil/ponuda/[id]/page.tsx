import { notFound, redirect } from "next/navigation";
import { customerGetProformaForDownload } from "@/app/customer/actions";
import { CustomerProformaDetail } from "@/components/CustomerProformaDetail";
import { getCustomerProfile } from "@/lib/customer-profile";
import { createPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata() {
  return createPageMetadata("profile");
}

export const dynamic = "force-dynamic";

export default async function CustomerProformaPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCustomerProfile();
  if (!profile) redirect("/najava");

  const { id } = await params;
  const result = await customerGetProformaForDownload(id);
  if (!result.ok) notFound();

  return (
    <CustomerProformaDetail
      documentNo={result.documentNo}
      status={result.status}
      createdAt={result.createdAt}
      payload={result.payload}
    />
  );
}
