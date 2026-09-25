import { notFound } from "next/navigation";
import { adminGetInquiry } from "@/app/admin/actions";
import { InquiryDetail } from "@/components/admin/InquiryDetail";

export const metadata = {
  title: "Inquiry",
  robots: { index: false, follow: false },
};

export default async function AdminInquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiry = await adminGetInquiry(id);
  if (!inquiry) notFound();
  return <InquiryDetail inquiry={inquiry} />;
}
