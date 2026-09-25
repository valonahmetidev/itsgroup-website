import { Suspense } from "react";
import { QuoteView } from "@/components/QuoteView";
import { createPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata() {
  return createPageMetadata("quote");
}

export const dynamic = "force-dynamic";

export default function QuotePage() {
  return (
    <Suspense fallback={null}>
      <QuoteView />
    </Suspense>
  );
}
