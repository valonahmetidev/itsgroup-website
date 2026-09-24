import { site } from "@/lib/site";

export function whatsAppDigits() {
  return site.whatsapp.replace(/\D/g, "");
}

export function buildWhatsAppContactUrl(message: string) {
  const trimmed = message.trim();
  if (!trimmed) return `https://wa.me/${whatsAppDigits()}`;
  return `https://wa.me/${whatsAppDigits()}?text=${encodeURIComponent(trimmed)}`;
}
