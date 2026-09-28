"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useLocale } from "@/components/LocaleProvider";
import { menuGroups, technologyMenuGroups } from "@/lib/catalog";
import { catalogHref, countProducts } from "@/lib/format";
import { useCategoryLabel } from "@/lib/i18n/catalog-labels";
import { menuGroupTitle } from "@/lib/i18n/menu";
import type { CatalogDivision } from "@/lib/divisions";
import type { MenuColumn, MenuLink, Source } from "@/lib/types";

function CategoryChildList({
  items,
  categoryLabel,
}: {
  items: MenuLink[];
  categoryLabel: (item: MenuColumn | MenuLink) => string;
}) {
  return (
    <ul className="mt-4 space-y-2">
      {items.map((child) => (
        <li key={child.href}>
          <Link href={child.href} className="text-sm hover:text-tech">
            {categoryLabel(child)}
            <span className="ml-2 text-ink/35">{child.count}</span>
          </Link>
          {child.children.length > 0 && (
            <ul className="mt-1 space-y-1 border-l border-ink/10 pl-3">
              {child.children.map((nested) => (
                <li key={nested.href}>
                  <Link href={nested.href} className="text-[13px] text-ink/65 hover:text-tech">
                    {categoryLabel(nested)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function CategoryColumnCard({
  column,
  categoryLabel,
  countLabel,
}: {
  column: MenuColumn;
  categoryLabel: (item: MenuColumn | MenuLink) => string;
  countLabel: string;
}) {
  const hasChildren = column.children.length > 0;

  return (
    <article className="rounded-3xl border border-ink/10 bg-card p-5">
      {hasChildren ? (
        <>
          <details className="group md:hidden">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-2 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0">
                <span className="font-display text-2xl leading-tight">{categoryLabel(column)}</span>
                <p className="mt-1 text-sm text-ink/45">{countLabel}</p>
              </div>
              <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-ink/40 transition group-open:rotate-180" />
            </summary>
            <div className="mt-3 border-t border-ink/10 pt-3">
              <Link href={column.href} className="text-sm font-semibold text-tech">
                {categoryLabel(column)}
              </Link>
              <CategoryChildList items={column.children} categoryLabel={categoryLabel} />
            </div>
          </details>
          <div className="hidden md:block">
            <Link href={column.href} className="font-display text-2xl leading-tight hover:text-tech">
              {categoryLabel(column)}
            </Link>
            <p className="mt-1 text-sm text-ink/45">{countLabel}</p>
            <CategoryChildList items={column.children} categoryLabel={categoryLabel} />
          </div>
        </>
      ) : (
        <>
          <Link href={column.href} className="font-display text-2xl leading-tight hover:text-tech">
            {categoryLabel(column)}
          </Link>
          <p className="mt-1 text-sm text-ink/45">{countLabel}</p>
        </>
      )}
    </article>
  );
}

export function DivisionPage({
  source,
  productCount,
  catalogDivision,
}: {
  source: Source;
  productCount: number;
  catalogDivision: CatalogDivision;
}) {
  const { dict } = useLocale();
  const categoryLabel = useCategoryLabel();
  const groups = source === "treco" ? technologyMenuGroups() : menuGroups(source);
  const content =
    source === "treco"
      ? { eyebrow: dict.nav.technology, title: dict.division.trecoTitle, text: dict.division.trecoText }
      : { eyebrow: dict.nav.home, title: dict.division.tremarkTitle, text: dict.division.tremarkText };

  return (
    <>
      <PageHeader eyebrow={content.eyebrow} title={content.title} text={content.text} />
      <div className="shell flex flex-wrap items-center justify-between gap-4 pb-6">
        <p className="text-sm text-ink/60">{countProducts(productCount, dict)}</p>
        <Link
          href={catalogHref({ division: catalogDivision })}
          className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream transition hover:opacity-90"
        >
          {dict.division.seeAllProducts}
        </Link>
      </div>
      <div className="shell space-y-12 pb-8">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="font-display text-3xl">{menuGroupTitle(dict, group.key, group.title)}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.columns.map((column) => (
                <CategoryColumnCard
                  key={column.href}
                  column={column}
                  categoryLabel={categoryLabel}
                  countLabel={countProducts(column.count, dict)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
