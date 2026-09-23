"use client";

import { useEffect, useState } from "react";
import { adminCreateCustomProduct, adminDeleteCustomProduct, adminListCustomProducts } from "@/app/admin/actions";
import { useLocale } from "@/components/LocaleProvider";
import { formatPrice } from "@/lib/format";
import type { CustomProductRow } from "@/lib/db";

export function CustomProductAdmin({ initial }: { initial: CustomProductRow[] }) {
  const { dict, locale } = useLocale();
  const [catalog, setCatalog] = useState(initial);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setCatalog(initial);
  }, [initial]);

  async function refresh() {
    const items = await adminListCustomProducts();
    setCatalog(items);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = await adminCreateCustomProduct({ name, price, note });
    if (!result.ok) {
      setStatus(dict.admin.saveError);
      return;
    }
    setName("");
    setPrice("");
    setNote("");
    setStatus(dict.admin.saveDone);
    await refresh();
  }

  async function onDelete(id: string) {
    await adminDeleteCustomProduct(id);
    await refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-ink/10 bg-card p-6">
        <h2 className="font-display text-2xl">{dict.admin.addCustom}</h2>
        <label className="grid gap-1 text-sm">
          <span>{dict.quote.productName}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
            required
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>{dict.quote.productPrice}</span>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>{dict.quote.productNote}</span>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
          />
        </label>
        <button type="submit" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper">
          {dict.admin.save}
        </button>
        {status && <p className="text-sm text-tech">{status}</p>}
      </form>

      <div className="space-y-2">
        {catalog.length === 0 ? (
          <p className="text-ink/60">{dict.admin.noCustom}</p>
        ) : (
          catalog.map((product) => (
            <article key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-card px-4 py-3">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-ink/55">
                  {formatPrice(product.price, locale, dict)}
                  {product.note ? ` · ${product.note}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void onDelete(product.id)}
                className="text-sm text-home hover:underline"
              >
                {dict.quote.remove}
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
