import { LegalDocumentView } from "@/components/LegalDocumentView";
import { createPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata() {
  return createPageMetadata("terms");
}

export default function TermsPage() {
  return <LegalDocumentView kind="terms" />;
}
