"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { Source } from "@/lib/types";

const STORAGE_KEY = "itsgroup-inquiry";

export type InquiryItem = {
  key: string;
  source: Source;
  id: number;
  name: string;
  price: number | null;
  image: string | null;
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
  addItem: (item: Omit<InquiryItem, "key">) => void;
  removeItem: (key: string) => void;
  clearItems: () => void;
  addMessage: (message: Omit<InquiryMessage, "id" | "createdAt">) => void;
};

const InquiryContext = createContext<InquiryState | null>(null);

export function InquiryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { items?: InquiryItem[]; messages?: InquiryMessage[] };
        setItems(parsed.items ?? []);
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
      addItem: (item) => {
        const key = `${item.source}-${item.id}`;
        setItems((current) => (current.some((entry) => entry.key === key) ? current : [...current, { ...item, key }]));
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

export function AddButton({
  source,
  id,
  name,
  price,
  image,
}: {
  source: Source;
  id: number;
  name: string;
  price: number | null;
  image: string | null;
}) {
  const { items, addItem } = useInquiry();
  const { dict } = useLocale();
  const saved = items.some((item) => item.key === `${source}-${id}`);

  return (
    <button
      type="button"
      onClick={() => addItem({ source, id, name, price, image })}
      disabled={saved}
      className="mt-3 w-full rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold transition hover:border-tech hover:text-tech disabled:cursor-default disabled:border-tech/20 disabled:bg-tech/10 disabled:text-tech"
    >
      {saved ? dict.product.inQuote : dict.product.addToQuote}
    </button>
  );
}
