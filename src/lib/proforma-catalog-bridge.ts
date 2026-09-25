import type { InquiryItem } from "@/components/Inquiry";
import type { DisplayCurrency } from "@/lib/currency";
import type { ProformaCustomer } from "@/lib/proforma-types";
import { clampQuantity, normalizeProductUnit } from "@/lib/units";

const TARGET_KEY = "itsgroup-proforma-catalog-target";
const QUEUE_PREFIX = "itsgroup-proforma-catalog-queue:";
const DRAFT_PREFIX = "itsgroup-proforma-draft:";

export const PROFORMA_DRAFT_CHANGED = "proforma-draft-changed";

export type ProformaDraftBundle = {
  items: InquiryItem[];
  customer: ProformaCustomer;
  currency: DisplayCurrency;
};

function queueKey(proformaId: string) {
  return `${QUEUE_PREFIX}${proformaId}`;
}

function draftKey(proformaId: string) {
  return `${DRAFT_PREFIX}${proformaId}`;
}

function normalizeItem(item: InquiryItem): InquiryItem {
  const unit = normalizeProductUnit(item.unit);
  return {
    ...item,
    unit,
    unitLocked: Boolean(item.unitLocked),
    quantity: clampQuantity(Number(item.quantity) || 1, unit),
  };
}

function mergeItem(list: InquiryItem[], incoming: InquiryItem): InquiryItem[] {
  const existing = list.find((entry) => entry.key === incoming.key);
  if (!existing) return [...list, incoming];
  const unit = incoming.unitLocked ? incoming.unit : existing.unit;
  return list.map((entry) =>
    entry.key === incoming.key
      ? normalizeItem({
          ...entry,
          quantity: clampQuantity(entry.quantity + incoming.quantity, unit),
          unit,
          unitLocked: incoming.unitLocked,
        })
      : entry,
  );
}

function notifyDraftChanged(proformaId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PROFORMA_DRAFT_CHANGED, { detail: { proformaId } }));
}

function migrateLegacyQueue(proformaId: string): InquiryItem[] {
  if (typeof window === "undefined") return [];
  const key = queueKey(proformaId);
  const raw = sessionStorage.getItem(key);
  if (!raw) return [];
  sessionStorage.removeItem(key);
  try {
    return (JSON.parse(raw) as InquiryItem[]).map(normalizeItem);
  } catch {
    return [];
  }
}

export function setProformaCatalogTarget(proformaId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TARGET_KEY, proformaId);
}

export function clearProformaCatalogTarget() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TARGET_KEY);
}

export function getProformaCatalogTarget(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TARGET_KEY);
}

export function readProformaDraftBundle(proformaId: string): ProformaDraftBundle | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(draftKey(proformaId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ProformaDraftBundle;
    return {
      ...parsed,
      items: (parsed.items ?? []).map(normalizeItem),
    };
  } catch {
    sessionStorage.removeItem(draftKey(proformaId));
    return null;
  }
}

export function writeProformaDraftBundle(proformaId: string, bundle: ProformaDraftBundle) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    draftKey(proformaId),
    JSON.stringify({
      ...bundle,
      items: bundle.items.map(normalizeItem),
    }),
  );
  notifyDraftChanged(proformaId);
}

export function readProformaDraftItems(proformaId: string): InquiryItem[] {
  const bundle = readProformaDraftBundle(proformaId);
  if (bundle?.items.length) return bundle.items;
  const legacy = migrateLegacyQueue(proformaId);
  if (legacy.length && bundle) {
    const merged = mergeInquiryLists(bundle.items, legacy);
    writeProformaDraftBundle(proformaId, { ...bundle, items: merged });
    return merged;
  }
  if (legacy.length) return legacy;
  return bundle?.items ?? [];
}

export function addToProformaDraft(proformaId: string, item: InquiryItem) {
  const bundle = readProformaDraftBundle(proformaId);
  const baseItems = bundle?.items ?? [];
  const nextItems = mergeItem(baseItems.map(normalizeItem), normalizeItem(item));
  writeProformaDraftBundle(proformaId, {
    customer: bundle?.customer ?? { name: "", phone: "", email: "", company: "" },
    currency: bundle?.currency ?? "EUR",
    items: nextItems,
  });
}

export function setProformaDraftItemQuantity(proformaId: string, itemKey: string, quantity: number) {
  const bundle = readProformaDraftBundle(proformaId);
  if (!bundle) return;
  const nextItems =
    quantity <= 0
      ? bundle.items.filter((item) => item.key !== itemKey)
      : bundle.items.map((item) =>
          item.key === itemKey
            ? normalizeItem({ ...item, quantity: clampQuantity(quantity, item.unit) })
            : item,
        );
  writeProformaDraftBundle(proformaId, { ...bundle, items: nextItems });
}

/** @deprecated Use addToProformaDraft */
export function enqueueProformaCatalogItem(proformaId: string, item: InquiryItem) {
  addToProformaDraft(proformaId, item);
}

/** @deprecated Use readProformaDraftItems + merge in editor */
export function drainProformaCatalogQueue(proformaId: string): InquiryItem[] {
  return migrateLegacyQueue(proformaId);
}

export function mergeInquiryLists(base: InquiryItem[], additions: InquiryItem[]): InquiryItem[] {
  let list = base.map(normalizeItem);
  for (const item of additions) {
    list = mergeItem(list, normalizeItem(item));
  }
  return list;
}

export function clearProformaDraft(proformaId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(draftKey(proformaId));
}
