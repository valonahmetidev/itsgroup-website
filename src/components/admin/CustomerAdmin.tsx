"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminDeleteCustomer, adminSaveCustomer } from "@/app/admin/actions";
import type { CustomerRow } from "@/app/admin/actions";
import { useLocale } from "@/components/LocaleProvider";
import { customerContactEmailFromRow, customerLoginName } from "@/lib/customer-account";

export function CustomerAdmin({ initial }: { initial: CustomerRow[] }) {
  const router = useRouter();
  const { dict } = useLocale();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [password, setPassword] = useState("");
  const [generalDiscount, setGeneralDiscount] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = await adminSaveCustomer({
      name,
      username,
      contactEmail,
      password,
      generalDiscount,
      active: true,
    });
    if (!result.ok) {
      setStatus(dict.admin.saveError);
      return;
    }
    setName("");
    setUsername("");
    setContactEmail("");
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
    <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-start">
      <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-ink/10 bg-card p-4">
        <h2 className="font-display text-lg">{dict.admin.addCustomer}</h2>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.customerName}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl border border-ink/10 bg-surface px-3 py-2 text-sm" />
        </label>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.customerUsername}</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="rounded-xl border border-ink/10 bg-surface px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.customerContactEmail}</span>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder={dict.admin.customerContactEmailHint}
            className="rounded-xl border border-ink/10 bg-surface px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.customerPassword}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-xl border border-ink/10 bg-surface px-3 py-2 text-sm" />
        </label>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.generalDiscount}</span>
          <input type="number" min={0} max={100} value={generalDiscount} onChange={(e) => setGeneralDiscount(e.target.value)} placeholder="%" className="rounded-xl border border-ink/10 bg-surface px-3 py-2 text-sm" />
        </label>
        <button type="submit" className="rounded-full bg-tech px-4 py-2 text-sm font-semibold text-cream">{dict.admin.save}</button>
        {status && <p className="text-sm text-tech">{status}</p>}
      </form>

      <div className="space-y-2">
        {initial.length === 0 ? (
          <p className="text-ink/60">{dict.admin.noCustomers}</p>
        ) : (
          initial.map((customer) => (
            <article key={customer.id} className="flex flex-col gap-3 rounded-xl border border-ink/10 bg-card px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">{customer.name}</p>
                <p className="break-all text-sm text-ink/55">
                  @{customerLoginName(customer)}
                  {customerContactEmailFromRow(customer.email) ? ` · ${customerContactEmailFromRow(customer.email)}` : ""}
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
