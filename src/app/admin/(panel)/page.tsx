import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Database, FileText, Inbox, Package, Pencil, Users } from "lucide-react";
import { adminListProformas, adminStats } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProformaAdminList } from "@/components/admin/ProformaAdminList";
import { getServerI18n } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const stats = await adminStats();
  const recentProformas = (await adminListProformas(5)).slice(0, 5);
  const { dict } = await getServerI18n();

  const cards = [
    {
      href: "/admin/products",
      label: dict.admin.catalogProducts,
      value: stats.catalogCount,
      icon: Package,
      tone: "bg-tech/10 text-tech",
    },
    {
      href: "/admin/products?edited=1",
      label: dict.admin.overrides,
      value: stats.overrideCount,
      icon: Pencil,
      tone: "bg-home/10 text-home",
    },
    {
      href: "/admin/custom",
      label: dict.admin.storeProducts,
      value: stats.storeCount,
      icon: Package,
      tone: "bg-ink/10 text-ink",
    },
    {
      href: "/admin/customers",
      label: dict.admin.customersCount,
      value: stats.customerCount,
      icon: Users,
      tone: "bg-tech/10 text-tech",
    },
    {
      href: "/admin/proformas",
      label: dict.admin.proformasCount,
      value: stats.proformaCount,
      icon: FileText,
      tone: "bg-tech/10 text-tech",
    },
    {
      href: "/admin/inquiries?status=new",
      label: dict.admin.newInquiries,
      value: stats.newInquiryCount,
      icon: Inbox,
      tone: "bg-home/10 text-home",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <AdminPageHeader title={dict.admin.dashboard} description={dict.admin.dashboardText} />
        <div className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-surface px-2.5 py-1 text-xs text-ink/55">
          <Database className="h-3.5 w-3.5 shrink-0 text-tech" />
          <span>{stats.databaseReady ? dict.admin.databaseReady : dict.admin.databaseMissing}</span>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group flex items-center gap-3 rounded-xl border border-ink/10 bg-card p-3 transition hover:border-tech"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.tone}`}>
              <card.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-ink/55">{card.label}</p>
              <p className="font-display text-xl leading-tight">{card.value}</p>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ink/25 transition group-hover:text-tech" />
          </Link>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl">{dict.admin.recentProformas}</h2>
          <Link href="/admin/proformas" className="text-sm font-semibold text-tech hover:underline">
            {dict.admin.proformas}
          </Link>
        </div>
        <ProformaAdminList items={recentProformas} />
      </section>
    </div>
  );
}
