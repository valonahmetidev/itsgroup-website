import type { InquiryItem } from "@/components/Inquiry";
import { clampQuantity, normalizeProductUnit } from "@/lib/units";

const TARGET_KEY = "itsgroup-proforma-catalog-target";
const QUEUE_PREFIX = "itsgroup-proforma-catalog-queue:";

function queueKey(proformaId: string) {
  return `${QUEUE_PREFIX}${proformaId}`;
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

export function enqueueProformaCatalogItem(proformaId: string, item: InquiryItem) {
  if (typeof window === "undefined") return;
  const key = queueKey(proformaId);
  const list = JSON.parse(sessionStorage.getItem(key) ?? "[]") as InquiryItem[];
  const next = mergeItem(list.map(normalizeItem), normalizeItem(item));
  sessionStorage.setItem(key, JSON.stringify(next));
}

export function drainProformaCatalogQueue(proformaId: string): InquiryItem[] {
  if (typeof window === "undefined") return [];
  const key = queueKey(proformaId);
  const raw = sessionStorage.getItem(key);
  sessionStorage.removeItem(key);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as InquiryItem[]).map(normalizeItem);
  } catch {
    sessionStorage.removeItem(key);
    return [];
  }
}

export function mergeInquiryLists(base: InquiryItem[], additions: InquiryItem[]): InquiryItem[] {
  let list = base.map(normalizeItem);
  for (const item of additions) {
    list = mergeItem(list, normalizeItem(item));
  }
  return list;
}
