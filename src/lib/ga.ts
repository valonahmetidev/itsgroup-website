/** GA4 measurement ID (client-safe). Supports either env name. */
export function publicGaId(): string {
  return (
    process.env.NEXT_PUBLIC_GA_ID?.trim() ||
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
    ""
  );
}
