"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminDeleteStoreProduct, adminSaveStoreProduct } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { UnitSelectField } from "@/components/admin/UnitSelectField";
import { useLocale } from "@/components/LocaleProvider";
import type { StoreProductRow } from "@/lib/db";

export function StoreProductForm({ row }: { row?: StoreProductRow }) {
  const router = useRouter();
  const { dict } = useLocale();
  const [nameMk, setNameMk] = useState(row?.name_mk ?? row?.name ?? "");
  const [nameEn, setNameEn] = useState(row?.name_en ?? "");
  const [nameSq, setNameSq] = useState(row?.name_sq ?? "");
  const [imageUrl, setImageUrl] = useState(row?.image_url ?? "");
  const [price, setPrice] = useState(row?.price?.toString() ?? "");
  const [regularPrice, setRegularPrice] = useState(row?.regular_price?.toString() ?? "");
  const [note, setNote] = useState(row?.note ?? "");
  const [inStock, setInStock] = useState(row ? row.in_stock === 1 : true);
  const [hidden, setHidden] = useState(row ? row.hidden === 1 : false);
  const [unit, setUnit] = useState(row?.unit ?? "");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const result = await adminSaveStoreProduct({
      id: row?.id,
      nameMk,
      nameEn,
      nameSq,
      imageUrl,
      price,
      regularPrice,
      note,
      inStock,
      hidden,
      unit,
    });
    setLoading(false);
    if (!result.ok) {
      setStatus(dict.admin.saveError);
      return;
    }
    setStatus(dict.admin.saveDone);
    if (!row?.id && result.id) {
      router.push(`/admin/products/its/${result.id}`);
      return;
    }
    router.refresh();
  }

  async function remove() {
    if (!row?.id) return;
    setLoading(true);
    await adminDeleteStoreProduct(row.id);
    setLoading(false);
    router.push("/admin/custom");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <form
        className="space-y-4 rounded-3xl border border-ink/10 bg-card p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <h3 className="font-display text-xl">{row ? dict.admin.editProduct : dict.admin.addCustom}</h3>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.nameMk}</span>
          <input
            value={nameMk}
            onChange={(event) => setNameMk(event.target.value)}
            required
            className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.nameEn}</span>
          <input
            value={nameEn}
            onChange={(event) => setNameEn(event.target.value)}
            className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.nameSq}</span>
          <input
            value={nameSq}
            onChange={(event) => setNameSq(event.target.value)}
            className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
          />
        </label>
        <ImageUploadField value={imageUrl} onChange={setImageUrl} alt={nameMk} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span>{dict.admin.price}</span>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>{dict.admin.regularPrice}</span>
            <input
              type="number"
              min={0}
              value={regularPrice}
              onChange={(event) => setRegularPrice(event.target.value)}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
            />
          </label>
        </div>
        <UnitSelectField value={unit} onChange={setUnit} />
        <label className="grid gap-1 text-sm">
          <span>{dict.quote.productNote}</span>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={inStock} onChange={(event) => setInStock(event.target.checked)} />
          <span>{dict.product.inStock}</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={hidden} onChange={(event) => setHidden(event.target.checked)} />
          <span>{dict.admin.hideProduct}</span>
        </label>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-50"
          >
            {dict.admin.save}
          </button>
          {row?.id && (
            <button
              type="button"
              disabled={loading}
              onClick={() => void remove()}
              className="rounded-full border border-home/30 px-5 py-2.5 text-sm font-semibold text-home"
            >
              {dict.quote.remove}
            </button>
          )}
          <Link href="/admin/custom" className="rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold">
            {dict.admin.back}
          </Link>
        </div>
        {status && <p className="text-sm text-tech">{status}</p>}
      </form>
    </div>
  );
}
