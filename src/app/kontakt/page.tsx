import { ContactView } from "@/components/ContactView";
import { createPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata() {
  return createPageMetadata("contact");
}

export const dynamic = "force-dynamic";

export default function ContactPage() {
  return <ContactView />;
}
