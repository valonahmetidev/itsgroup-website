import { NotFoundView } from "@/components/NotFoundView";
import { createPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata() {
  return createPageMetadata("notFound");
}

export default function NotFound() {
  return <NotFoundView />;
}
