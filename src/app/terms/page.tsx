import { LegalDocumentView } from "@/components/LegalDocumentView";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-static";
export const revalidate = 120;
export const metadata = createStaticPageMetadata("terms");

export default function TermsPage() {
  return <LegalDocumentView kind="terms" />;
}
