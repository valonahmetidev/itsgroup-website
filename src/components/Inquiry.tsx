"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import { UnitSelect } from "@/components/UnitSelect";
import {
  clampQuantity,
  minQuantity,
  normalizeProductUnit,
  parseQuantityInput,
  quantityFieldValue,
  quantityInputStep,
  quantityStep,
  type ProductUnit,
} from "@/lib/units";
import { SelectField } from "@/components/ui/SelectField";
import type { ProductNames } from "@/lib/product-names";
import type { ProductType, Source } from "@/lib/types";

const STORAGE_KEY = "itsgroup-inquiry";

export type InquiryItem = {
  key: string;
  source: Source | "custom";
  id: number | string;
  name: string;
  names?: ProductNames;
  price: number | null;
  image: string | null;
  quantity: number;
  unit: ProductUnit;
  unitLocked: boolean;
};

export type InquiryMessage = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
};

type InquiryState = {
  items: InquiryItem[];
  messages: InquiryMessage[];
  addItem: (
    item: Omit<InquiryItem, "key" | "quantity"> & { unit?: ProductUnit; unitLocked?: boolean; variantId?: string },
    quantity?: number,
  ) => void;
  setItemQuantity: (key: string, quantity: number) => void;
  setItemUnit: (key: string, unit: ProductUnit) => void;
  removeItem: (key: string) => void;
  clearItems: () => void;
  addMessage: (message: Omit<InquiryMessage, "id" | "createdAt">) => void;
};

const InquiryContext = createContext<InquiryState | null>(null);

function itemKey(source: Source | "custom", id: number | string, variantId?: string) {
  const base = source === "custom" ? `custom-${id}` : `${source}-${id}`;
  return variantId ? `${base}--${variantId}` : base;
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

export function InquiryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { items?: InquiryItem[]; messages?: InquiryMessage[] };
        setItems((parsed.items ?? []).map(normalizeItem));
        setMessages(parsed.messages ?? []);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, messages }));
  }, [items, messages, ready]);

  const value = useMemo<InquiryState>(
    () => ({
      items,
      messages,
      addItem: (item, quantity = 1) => {
        const key = itemKey(item.source, item.id, item.variantId);
        const unitLocked = Boolean(item.unitLocked);
        const unit = normalizeProductUnit(item.unit);
        const amount = clampQuantity(quantity, unit);
        setItems((current) => {
          const existing = current.find((entry) => entry.key === key);
          if (existing) {
            return current.map((entry) =>
              entry.key === key
                ? normalizeItem({
                    ...entry,
                    quantity: clampQuantity(entry.quantity + amount, unitLocked ? unit : entry.unit),
                    unit: unitLocked ? unit : entry.unit,
                    unitLocked,
                  })
                : entry,
            );
          }
          return [...current, normalizeItem({ ...item, key, quantity: amount, unit, unitLocked })];
        });
      },
      setItemQuantity: (key, quantity) => {
        setItems((current) =>
          current.map((item) =>
            item.key === key ? { ...item, quantity: clampQuantity(quantity, item.unit) } : item,
          ),
        );
      },
      setItemUnit: (key, unit) => {
        setItems((current) =>
          current.map((item) =>
            item.key === key && !item.unitLocked
              ? normalizeItem({ ...item, unit: normalizeProductUnit(unit) })
              : item,
          ),
        );
      },
      removeItem: (key) => setItems((current) => current.filter((item) => item.key !== key)),
      clearItems: () => setItems([]),
      addMessage: (message) =>
        setMessages((current) => [
          {
            ...message,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          },
          ...current,
        ]),
    }),
    [items, messages],
  );

  return <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>;
}

export function useInquiry() {
  const value = useContext(InquiryContext);
  if (!value) throw new Error("useInquiry must be used within InquiryProvider");
  return value;
}

export function lineTotal(item: InquiryItem) {
  if (item.price == null || item.price <= 0) return null;
  return item.price * item.quantity;
}

function QuantityControl({
  quantity,
  unit,
  onChange,
  compact = false,
}: {
  quantity: number;
  unit: ProductUnit;
  onChange: (quantity: number) => void;
  compact?: boolean;
}) {
  const { dict } = useLocale();
  const adjustStep = quantityStep(unit);
  const inputStep = quantityInputStep(unit);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => quantityFieldValue(quantity));

  useEffect(() => {
    if (!editing) {
      setDraft(quantityFieldValue(quantity));
    }
  }, [quantity, editing]);

  function commitDraft() {
    const parsed = parseQuantityInput(draft);
    if (parsed != null) {
      onChange(clampQuantity(parsed, unit));
    } else {
      setDraft(quantityFieldValue(quantity));
    }
    setEditing(false);
  }

  function adjust(delta: number) {
    setEditing(false);
    onChange(clampQuantity(quantity + delta, unit));
  }

  return (
    <div className={compact ? "inline-flex shrink-0 items-center gap-1" : "flex items-center gap-2"}>
      {!compact && <span className="text-xs text-ink/55">{dict.product.quantity}</span>}
      <div className="inline-flex items-center rounded-full border border-ink/10 bg-surface">
        <button
          type="button"
          aria-label={dict.product.decreaseQuantity}
          onClick={() => adjust(-adjustStep)}
          className={cn(
            "flex items-center justify-center rounded-full hover:bg-paper",
            compact ? "h-8 w-8" : "h-9 w-9",
          )}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          type="number"
          min={minQuantity(unit)}
          max={9999}
          step={inputStep}
          value={editing ? draft : quantityFieldValue(quantity)}
          onFocus={() => {
            setDraft(quantityFieldValue(quantity));
            setEditing(true);
          }}
          onBlur={commitDraft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitDraft();
              event.currentTarget.blur();
            }
          }}
          className={cn(
            "border-0 bg-transparent text-center font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            compact ? "w-16 text-xs" : "w-[4.5rem] text-sm",
          )}
          aria-label={dict.product.quantity}
        />
        <button
          type="button"
          aria-label={dict.product.increaseQuantity}
          onClick={() => adjust(adjustStep)}
          className={cn(
            "flex items-center justify-center rounded-full hover:bg-paper",
            compact ? "h-8 w-8" : "h-9 w-9",
          )}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function AddButton({
  source,
  id,
  name,
  names,
  price,
  image,
  unit,
  unitLocked = false,
  types,
  initialTypeId,
  variant = "card",
}: {
  source: Source;
  id: number | string;
  name: string;
  names?: ProductNames;
  price: number | null;
  image: string | null;
  unit?: ProductUnit;
  unitLocked?: boolean;
  types?: ProductType[];
  initialTypeId?: string;
  variant?: "card" | "detail";
}) {
  const { items, addItem, setItemQuantity, removeItem } = useInquiry();
  const { dict } = useLocale();
  const hasTypes = Boolean(types && types.length > 0);
  const [selectedTypeId, setSelectedTypeId] = useState(() => initialTypeId ?? types?.[0]?.id ?? "");
  const selectedType = types?.find((type) => type.id === selectedTypeId);
  const quoteName = selectedType ? `${name} — ${selectedType.name}` : name;
  const key = itemKey(source, id, selectedType?.id);
  const saved = items.find((item) => item.key === key);
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<ProductUnit>(() => normalizeProductUnit(unit));
  const detail = variant === "detail";
  const locked = unitLocked;
  const productUnit = locked ? normalizeProductUnit(unit) : selectedUnit;

  if (saved) {
    if (detail) {
      return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-tech/20 bg-tech/5 px-3 py-2.5">
          <QuantityControl
            quantity={saved.quantity}
            unit={saved.unit}
            onChange={(next) => {
              if (next <= 0) removeItem(key);
              else setItemQuantity(key, next);
            }}
            compact
          />
          <p className="text-sm font-semibold text-tech">{dict.product.inQuote}</p>
        </div>
      );
    }

    return (
      <div className="mt-3 w-full min-w-0 overflow-hidden rounded-2xl border border-tech/20 bg-tech/5 p-2">
        <div className="flex justify-center">
          <QuantityControl
            quantity={saved.quantity}
            unit={saved.unit}
            onChange={(next) => {
              if (next <= 0) removeItem(key);
              else setItemQuantity(key, next);
            }}
            compact
          />
        </div>
        <p className="mt-1.5 truncate text-center text-xs font-semibold text-tech">{dict.product.inQuote}</p>
      </div>
    );
  }

  if (detail) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-3">
        {hasTypes && (
          <SelectField
            value={selectedTypeId}
            onChange={setSelectedTypeId}
            label={dict.product.selectType}
            shape="pill"
            className="w-full min-w-0"
            fullWidth
            options={types!.map((type) => ({ value: type.id, label: type.name }))}
          />
        )}
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          {!locked && (
            <UnitSelect
              value={selectedUnit}
              onChange={setSelectedUnit}
              label={dict.product.unit}
              shape="pill"
              className="w-full min-w-0 sm:w-auto sm:min-w-[7rem] sm:flex-1"
              fullWidth
            />
          )}
          <QuantityControl quantity={quantity} unit={productUnit} onChange={setQuantity} compact />
          <button
            type="button"
            disabled={hasTypes && !selectedType}
            onClick={() =>
              addItem(
                {
                  source,
                  id,
                  name: quoteName,
                  names,
                  price,
                  image,
                  unit: productUnit,
                  unitLocked: locked,
                  variantId: selectedType?.id,
                },
                quantity,
              )
            }
            className="w-full rounded-full bg-tech px-6 py-3 text-sm font-semibold text-cream transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:flex-1 sm:min-w-[10rem]"
          >
            {dict.product.addToQuote}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {!locked && (
          <UnitSelect
            value={selectedUnit}
            onChange={setSelectedUnit}
            label={dict.product.unit}
            shape="pill"
            size="compact"
            placement="top"
            fullWidth={false}
            hideLabel
            className="shrink-0"
          />
        )}
        <QuantityControl quantity={quantity} unit={productUnit} onChange={setQuantity} compact />
      </div>
      <button
        type="button"
        onClick={() => addItem({ source, id, name, names, price, image, unit: productUnit, unitLocked: locked }, quantity)}
        className="w-full rounded-full border border-ink/10 px-3 py-2 text-sm font-semibold transition hover:border-tech hover:text-tech"
      >
        {dict.product.addToQuote}
      </button>
    </div>
  );
}

export function QuoteQuantityControl({ item }: { item: InquiryItem }) {
  const { setItemQuantity, removeItem } = useInquiry();

  return (
    <QuantityControl
      quantity={item.quantity}
      unit={item.unit}
      onChange={(next) => {
        if (next <= 0) removeItem(item.key);
        else setItemQuantity(item.key, next);
      }}
      compact
    />
  );
}
