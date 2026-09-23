import type { Metadata } from "next";
import { adminListCustomers } from "@/app/admin/actions";
import { CustomerAdmin } from "@/components/admin/CustomerAdmin";
import { getServerI18n } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

export default async function AdminCustomersPage() {
  const { dict } = await getServerI18n();
  const customers = await adminListCustomers();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl">{dict.admin.customers}</h2>
        <p className="mt-2 text-ink/60">{dict.admin.customersText}</p>
      </div>
      <CustomerAdmin initial={customers} />
    </div>
  );
}
