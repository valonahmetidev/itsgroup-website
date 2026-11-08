import { LegalDocumentView } from "@/components/LegalDocumentView";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-static";
export const revalidate = 120;
export const metadata = createStaticPageMetadata("privacy");

export default function PrivacyPage() {
  return <LegalDocumentView kind="privacy" />;
}
