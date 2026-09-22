"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { useLocale } from "@/components/LocaleProvider";
import { menuGroups, products } from "@/lib/catalog";
import { countProducts } from "@/lib/format";
import { menuGroupTitle } from "@/lib/i18n/menu";
import { sourceMeta } from "@/lib/site";
import type { Source } from "@/lib/types";

export function DivisionPage({ source }: { source: Source }) {
  const { dict } = useLocale();
  const groups = menuGroups(source);
  const total = products.filter((product) => product.source === source).length;
  const meta = sourceMeta[source];
  const content =
    source === "treco"
      ? { eyebrow: "Treco", title: dict.division.trecoTitle, text: dict.division.trecoText }
      : { eyebrow: "Tremark", title: dict.division.tremarkTitle, text: dict.division.tremarkText };

  return (
    <>
      <PageHeader eyebrow={content.eyebrow} title={content.title} text={content.text} />
      <div className="shell pb-6 text-sm text-ink/60">
        {countProducts(total, dict)} ·{" "}
        <a href={meta.origin} className="font-semibold text-tech">
          {meta.origin.replace("https://", "")}
        </a>
      </div>
      <div className="shell space-y-12 pb-8">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="font-display text-3xl">{menuGroupTitle(dict, group.key, group.title)}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.columns.map((column) => (
                <article key={column.href} className="rounded-3xl border border-ink/10 bg-card p-5">
                  <Link href={column.href} className="font-display text-2xl leading-tight hover:text-tech">
                    {column.title}
                  </Link>
                  <p className="mt-1 text-sm text-ink/45">{countProducts(column.count, dict)}</p>
                  {column.children.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {column.children.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href} className="text-sm hover:text-tech">
                            {child.name}
                            <span className="ml-2 text-ink/35">{child.count}</span>
                          </Link>
                          {child.children.length > 0 && (
                            <ul className="mt-1 space-y-1 border-l border-ink/10 pl-3">
                              {child.children.map((nested) => (
                                <li key={nested.href}>
                                  <Link href={nested.href} className="text-[13px] text-ink/65 hover:text-tech">
                                    {nested.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
