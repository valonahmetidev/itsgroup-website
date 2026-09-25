import Link from "next/link";
import { adminListInquiries } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InquiryAdminList } from "@/components/admin/InquiryAdminList";
import { getDictionary } from "@/lib/i18n";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export const metadata = {
  title: "Inquiries",
  robots: { index: false, follow: false },
};

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : "mk";
  const dict = getDictionary(locale);
  const { status: rawStatus } = await searchParams;
  const status = rawStatus === "new" || rawStatus === "read" ? rawStatus : "all";
  const items = await adminListInquiries(status);

  const filters = [
    { value: "all", label: dict.catalog.all },
    { value: "new", label: dict.admin.inquiryStatusNew },
    { value: "read", label: dict.admin.inquiryStatusRead },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader title={dict.admin.inquiries} description={dict.admin.inquiriesText} />
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === "all" ? "/admin/inquiries" : `/admin/inquiries?status=${filter.value}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              status === filter.value ? "bg-ink text-paper" : "bg-surface hover:bg-ink/5",
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>
      <InquiryAdminList items={items} />
    </div>
  );
}
