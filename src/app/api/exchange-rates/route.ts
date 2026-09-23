import { getExchangeRates } from "@/lib/exchange-rates";

export async function GET() {
  const snapshot = await getExchangeRates();
  return Response.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
