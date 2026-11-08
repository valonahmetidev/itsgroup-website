import { ContactView } from "@/components/ContactView";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-static";
export const revalidate = 120;
export const metadata = createStaticPageMetadata("contact");

export default function ContactPage() {
  return <ContactView />;
}
