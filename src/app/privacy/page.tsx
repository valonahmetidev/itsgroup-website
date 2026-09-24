import { LegalDocumentView } from "@/components/LegalDocumentView";
import { createPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata() {
  return createPageMetadata("privacy");
}

export default function PrivacyPage() {
  return <LegalDocumentView kind="privacy" />;
}
