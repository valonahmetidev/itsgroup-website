import { QuoteView } from "@/components/QuoteView";
import { getCustomerProfile } from "@/lib/customer-profile";
import { createPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata() {
  return createPageMetadata("quote");
}

export const dynamic = "force-dynamic";

export default async function QuotePage() {
  const profile = await getCustomerProfile();
  return <QuoteView customerLoggedIn={Boolean(profile)} />;
}
