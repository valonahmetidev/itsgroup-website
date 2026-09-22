import type { Dictionary, MenuGroupKey } from "@/lib/i18n/types";

export function menuGroupTitle(dict: Dictionary, key: string, fallback: string) {
  const label = dict.menuGroups[key as MenuGroupKey];
  return label ?? fallback;
}
