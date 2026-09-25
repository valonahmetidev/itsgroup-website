"use client";

import Link from "next/link";
import type { CustomerProformaSummary } from "@/app/customer/actions";
import { useLocale } from "@/components/LocaleProvider";
import { formatPrice } from "@/lib/format";

export function ProfileView({
  profile,
  proformas,
}: {
  profile: { name: string; email: string; discountPercent: number | null };
  proformas: CustomerProformaSummary[];
}) {
  const { dict, locale } = useLocale();

  return (
    <div className="shell py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tech">{dict.customer.profile}</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">{dict.customer.profileTitle}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/70">{dict.customer.profileText}</p>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border border-ink/10 bg-card p-6">
          <h2 className="font-display text-2xl">{profile.name}</h2>
          <p className="mt-2 text-sm text-ink/60">{profile.email}</p>
          {profile.discountPercent != null && (
            <p className="mt-4 text-sm font-semibold text-tech">
              {dict.customer.generalDiscountLabel}: -{profile.discountPercent}%
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/katalog" className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream">
              {dict.customer.openCatalog}
            </Link>
            <Link
              href="/ponuda"
              className="rounded-full border border-ink/10 bg-surface px-5 py-2.5 text-sm font-semibold hover:border-tech"
            >
              {dict.customer.openQuote}
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-ink/10 bg-card p-6">
          <h2 className="font-display text-2xl">{dict.customer.myProformas}</h2>
          {proformas.length === 0 ? (
            <p className="mt-4 text-sm text-ink/55">{dict.customer.noProformas}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {proformas.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-surface/50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{item.documentNo}</p>
                    <p className="text-xs text-ink/50">
                      {new Date(item.createdAt).toLocaleDateString(locale)} ·{" "}
                      {item.status === "sent" ? dict.admin.proformaStatusSent : dict.admin.proformaStatusDraft}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold tabular-nums">
                      {item.total != null ? formatPrice(item.total, locale, dict) : dict.product.onRequest}
                    </p>
                    <Link href={`/profil/ponuda/${item.id}`} className="text-sm font-semibold text-tech hover:underline">
                      {dict.customer.viewProforma}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
