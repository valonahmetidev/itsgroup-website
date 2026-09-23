import type { Metadata } from "next";
import { adminListCustomers } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
    <div className="space-y-4">
      <AdminPageHeader title={dict.admin.customers} description={dict.admin.customersText} />
      <CustomerAdmin initial={customers} />
    </div>
  );
}
