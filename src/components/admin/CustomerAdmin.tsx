"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminDeleteCustomer, adminSaveCustomer } from "@/app/admin/actions";
import type { CustomerRow } from "@/app/admin/actions";
import { useLocale } from "@/components/LocaleProvider";

export function CustomerAdmin({ initial }: { initial: CustomerRow[] }) {
  const router = useRouter();
  const { dict } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [generalDiscount, setGeneralDiscount] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = await adminSaveCustomer({
      name,
      email,
      password,
      generalDiscount,
      active: true,
    });
    if (!result.ok) {
      setStatus(dict.admin.saveError);
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    setGeneralDiscount("");
    setStatus(dict.admin.saveDone);
    router.refresh();
  }

  async function onDelete(id: string) {
    await adminDeleteCustomer(id);
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-ink/10 bg-card p-6">
        <h2 className="font-display text-2xl">{dict.admin.addCustomer}</h2>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.customerName}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5" />
        </label>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.customerEmail}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5" />
        </label>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.customerPassword}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5" />
        </label>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.generalDiscount}</span>
          <input type="number" min={0} max={100} value={generalDiscount} onChange={(e) => setGeneralDiscount(e.target.value)} placeholder="%" className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5" />
        </label>
        <button type="submit" className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream">{dict.admin.save}</button>
        {status && <p className="text-sm text-tech">{status}</p>}
      </form>

      <div className="space-y-2">
        {initial.length === 0 ? (
          <p className="text-ink/60">{dict.admin.noCustomers}</p>
        ) : (
          initial.map((customer) => (
            <article key={customer.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-card px-4 py-3">
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-ink/55">
                  {customer.email}
                  {customer.discount_percent != null ? ` · -${customer.discount_percent}%` : ""}
                </p>
              </div>
              <div className="flex gap-3">
                <Link href={`/admin/customers/${customer.id}`} className="text-sm font-semibold text-tech hover:underline">
                  {dict.admin.editCustomer}
                </Link>
                <button type="button" onClick={() => void onDelete(customer.id)} className="text-sm text-home hover:underline">
                  {dict.admin.deleteCustomer}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
