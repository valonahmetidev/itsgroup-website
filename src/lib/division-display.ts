import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import type { Source } from "@/lib/types";

/** Customer-facing division label — never shows Treco/Tremark brand names. */
export function customerDivisionLabel(source: Source, locale: Locale, dict: Dictionary) {
  if (source === "its") return "ITS Group";
  if (source === "treco") return dict.nav.technology;
  return dict.nav.home;
}

export function customerDivisionTone(source: Source): "tech" | "home" {
  if (source === "tremark") return "home";
  return "tech";
}
