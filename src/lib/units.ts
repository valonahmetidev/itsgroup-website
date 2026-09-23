import type { Locale } from "@/lib/i18n";

export type ProductUnit = "pc" | "kg" | "m" | "m2" | "l" | "set";

export const PRODUCT_UNITS: ProductUnit[] = ["pc", "kg", "m", "m2", "l", "set"];

const unitLabels: Record<ProductUnit, Record<Locale, string>> = {
  pc: { mk: "ком", sq: "copë", en: "pc" },
  kg: { mk: "кг", sq: "kg", en: "kg" },
  m: { mk: "м", sq: "m", en: "m" },
  m2: { mk: "м²", sq: "m²", en: "m²" },
  l: { mk: "л", sq: "l", en: "l" },
  set: { mk: "сет", sq: "set", en: "set" },
};

export function normalizeProductUnit(unit?: string | null): ProductUnit {
  if (unit && PRODUCT_UNITS.includes(unit as ProductUnit)) return unit as ProductUnit;
  return "pc";
}

export function parseAdminUnit(value: string): ProductUnit | null {
  const cleaned = value.trim();
  if (!cleaned) return null;
  return normalizeProductUnit(cleaned);
}

export function unitLabel(unit: string, locale: Locale) {
  const key = normalizeProductUnit(unit);
  return unitLabels[key][locale];
}

export function allowsDecimalQuantity(unit: string) {
  const key = normalizeProductUnit(unit);
  return key !== "pc" && key !== "set";
}

/** Step for +/- buttons — always whole numbers. */
export function quantityStep(_unit: string) {
  return 1;
}

/** HTML input step: integers for pieces/sets, decimals allowed for measure units. */
export function quantityInputStep(unit: string): number | "any" {
  return allowsDecimalQuantity(unit) ? "any" : 1;
}

export function minQuantity(unit: string) {
  const key = normalizeProductUnit(unit);
  return key === "pc" || key === "set" ? 1 : 0.01;
}

export function roundQuantity(value: number) {
  return Math.round(value * 100) / 100;
}

export function parseQuantityInput(value: string): number | null {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed || trimmed === "." || trimmed === "-") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function clampQuantity(value: number, unit?: string) {
  const min = unit ? minQuantity(unit) : 0.01;
  let next = roundQuantity(value);
  if (unit && !allowsDecimalQuantity(unit)) {
    next = Math.round(next);
  }
  return Math.max(min, Math.min(9999, next));
}

/** Dot-decimal string for HTML quantity inputs (never locale commas). */
export function quantityFieldValue(quantity: number) {
  const rounded = roundQuantity(quantity);
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2);
}

export function formatQuantityValue(quantity: number, locale: Locale) {
  const tag = locale === "mk" ? "mk-MK" : locale === "sq" ? "sq-AL" : "en-GB";
  if (Number.isInteger(quantity)) return String(quantity);
  return quantity.toLocaleString(tag, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatQuantity(quantity: number, unit: string, locale: Locale) {
  const value = formatQuantityValue(quantity, locale);
  const label = unitLabel(unit, locale);
  return `${value} ${label}`;
}
