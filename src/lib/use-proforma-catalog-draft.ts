"use client";

import { useCallback, useEffect, useState } from "react";
import type { InquiryItem } from "@/components/Inquiry";
import {
  PROFORMA_DRAFT_CHANGED,
  getProformaCatalogTarget,
  readProformaDraftItems,
  setProformaDraftItemQuantity,
} from "@/lib/proforma-catalog-bridge";

export function useProformaCatalogDraft(explicitProformaId?: string | null) {
  const [proformaId, setProformaId] = useState<string | null>(() => explicitProformaId ?? getProformaCatalogTarget());
  const [items, setItems] = useState<InquiryItem[]>([]);

  const refresh = useCallback(() => {
    const id = explicitProformaId ?? getProformaCatalogTarget();
    setProformaId(id);
    if (id) setItems(readProformaDraftItems(id));
    else setItems([]);
  }, [explicitProformaId]);

  useEffect(() => {
    refresh();
    const onDraft = (event: Event) => {
      const detail = (event as CustomEvent<{ proformaId: string }>).detail;
      const id = explicitProformaId ?? getProformaCatalogTarget();
      if (id && detail?.proformaId === id) refresh();
    };
    const onFocus = () => refresh();
    window.addEventListener(PROFORMA_DRAFT_CHANGED, onDraft);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener(PROFORMA_DRAFT_CHANGED, onDraft);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh, explicitProformaId]);

  const setItemQuantity = useCallback(
    (itemKey: string, quantity: number) => {
      const id = explicitProformaId ?? getProformaCatalogTarget();
      if (!id) return;
      setProformaDraftItemQuantity(id, itemKey, quantity);
      refresh();
    },
    [explicitProformaId, refresh],
  );

  return { proformaId, items, refresh, setItemQuantity };
}
