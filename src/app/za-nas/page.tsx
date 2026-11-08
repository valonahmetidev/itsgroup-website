import { AboutView } from "@/components/AboutView";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-static";
export const revalidate = 120;
export const metadata = createStaticPageMetadata("about");

export default function AboutPage() {
  return <AboutView />;
}
