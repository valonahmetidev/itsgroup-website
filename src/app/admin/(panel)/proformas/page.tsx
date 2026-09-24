import Link from "next/link";
import { adminListProformas } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProformaAdminList } from "@/components/admin/ProformaAdminList";
import { getDictionary } from "@/lib/i18n";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n";

export const metadata = {
  title: "Proformas",
  robots: { index: false, follow: false },
};

export default async function AdminProformasPage() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : "mk";
  const dict = getDictionary(locale);
  const items = await adminListProformas();

  return (
    <div className="space-y-4">
      <AdminPageHeader title={dict.admin.proformas} description={dict.admin.proformasText} />
      <div>
        <Link
          href="/admin/proformas/new"
          className="inline-flex rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper"
        >
          {dict.admin.newProforma}
        </Link>
      </div>
      <ProformaAdminList items={items} />
    </div>
  );
}
