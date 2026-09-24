import { adminGetCategoryMenu } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryAdmin } from "@/components/admin/CategoryAdmin";
import { getDictionary } from "@/lib/i18n";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n";
import { isCatalogSource } from "@/lib/catalog";
import { cookies } from "next/headers";

export const metadata = {
  title: "Admin categories",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source: sourceParam } = await searchParams;
  const source = sourceParam && isCatalogSource(sourceParam) ? sourceParam : "tremark";
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : "mk";
  const dict = getDictionary(locale);
  const groups = await adminGetCategoryMenu(source);

  return (
    <div className="space-y-4">
      <AdminPageHeader title={dict.admin.categoriesTitle} description={dict.admin.categoriesText} />
      <CategoryAdmin source={source} groups={groups} />
    </div>
  );
}
