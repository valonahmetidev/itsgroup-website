import { getDbAsync } from "@/lib/cloudflare";
import { getCustomerProfile } from "@/lib/customer-profile";
import { loadCustomerPricing } from "@/lib/customers";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "private, no-store" };
const anonymous = { profile: null, pricing: null };

export async function GET() {
  const profile = await getCustomerProfile();
  if (!profile) {
    return Response.json(anonymous, { headers: noStore });
  }

  const db = await getDbAsync();
  if (!db) {
    return Response.json(anonymous, { headers: noStore });
  }

  try {
    const pricing = await loadCustomerPricing(db, profile.id);
    return Response.json(
      {
        profile: {
          name: profile.name,
          discountPercent: profile.discountPercent,
        },
        pricing: pricing
          ? {
              generalDiscountPercent: pricing.generalDiscountPercent,
              productDiscounts: Object.fromEntries(pricing.productDiscounts),
            }
          : null,
      },
      { headers: noStore },
    );
  } catch {
    return Response.json(anonymous, { headers: noStore });
  }
}
