import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Database, Package, Pencil, Users } from "lucide-react";
import { adminStats } from "@/app/admin/actions";
import { getServerI18n } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const stats = await adminStats();
  const { dict } = await getServerI18n();

  const cards = [
    {
      href: "/admin/products",
      label: dict.admin.catalogProducts,
      value: stats.catalogCount,
      icon: Package,
      tone: "text-tech",
    },
    {
      href: "/admin/products?edited=1",
      label: dict.admin.overrides,
      value: stats.overrideCount,
      icon: Pencil,
      tone: "text-home",
    },
    {
      href: "/admin/custom",
      label: dict.admin.storeProducts,
      value: stats.storeCount,
      icon: Package,
      tone: "text-ink",
    },
    {
      href: "/admin/customers",
      label: dict.admin.customersCount,
      value: stats.customerCount,
      icon: Users,
      tone: "text-tech",
    },
  ];

  const actions = [
    { href: "/admin/products", label: dict.admin.viewProducts },
    { href: "/admin/customers", label: dict.admin.viewCustomers },
    { href: "/admin/custom", label: dict.admin.addCustom },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl">{dict.admin.dashboard}</h2>
        <p className="mt-2 text-ink/60">{dict.admin.dashboardText}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-3xl border border-ink/10 bg-card p-5 transition hover:border-tech hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <card.icon className={`h-5 w-5 ${card.tone}`} />
              <ArrowUpRight className="h-4 w-4 text-ink/30 transition group-hover:text-tech" />
            </div>
            <p className="mt-4 text-sm text-ink/55">{card.label}</p>
            <p className="mt-2 font-display text-3xl">{card.value}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-3xl border border-ink/10 bg-card p-6">
        <h3 className="font-display text-xl">{dict.admin.quickActions}</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link
              key={action.href + action.label}
              href={action.href}
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-surface px-4 py-2.5 text-sm font-semibold transition hover:border-tech hover:text-tech"
            >
              {action.label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </section>

      <article className="flex items-center gap-4 rounded-3xl border border-ink/10 bg-surface px-5 py-4">
        <Database className="h-5 w-5 text-tech" />
        <div>
          <p className="text-sm font-semibold">{dict.admin.database}</p>
          <p className="text-sm text-ink/55">
            {stats.databaseReady ? dict.admin.databaseReady : dict.admin.databaseMissing}
          </p>
        </div>
      </article>
    </div>
  );
}
