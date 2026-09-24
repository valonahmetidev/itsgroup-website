import { AboutView } from "@/components/AboutView";
import { createPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata() {
  return createPageMetadata("about");
}

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return <AboutView />;
}
