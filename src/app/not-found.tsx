import { NotFoundView } from "@/components/NotFoundView";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const metadata = createStaticPageMetadata("notFound");

export default function NotFound() {
  return <NotFoundView />;
}
