export const CONSENT_COOKIE = "its-consent";

export type ConsentChoice = "accepted" | "rejected";

export function parseConsentCookie(value: string | undefined): ConsentChoice | null {
  if (value === "accepted" || value === "rejected") return value;
  return null;
}
