"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useLocale } from "@/components/LocaleProvider";
import { menuGroups, technologyMenuGroups } from "@/lib/catalog";
import { useCategoryLabel } from "@/lib/i18n/catalog-labels";
import { menuGroupTitle } from "@/lib/i18n/menu";
import { site } from "@/lib/site";

export function Footer() {
  const { dict } = useLocale();
  const categoryLabel = useCategoryLabel();
  const tech = technologyMenuGroups();
  const home = menuGroups("tremark")[0];

  return (
    <footer className="mt-20 border-t border-ink/10 bg-surface text-ink dark:border-white/10 dark:bg-night dark:text-cream">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo href="/" variant="footer" />
          <p className="mt-5 max-w-sm text-sm leading-6 text-ink/65 dark:text-cream/70">{dict.footer.text}</p>
          <a
            href={site.phoneHref}
            className="mt-4 inline-block text-sm font-medium text-ink hover:text-tech dark:text-cream dark:hover:text-white"
          >
            {site.phone}
          </a>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45 dark:text-cream/45">
            {dict.footer.technology}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink/75 dark:text-cream/80">
            {tech.map((group) => (
              <li key={group.key}>
                <Link href="/tehnologija" className="hover:text-tech dark:hover:text-white">
                  {menuGroupTitle(dict, group.key, group.title)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45 dark:text-cream/45">
            {dict.footer.home}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink/75 dark:text-cream/80">
            {home?.columns.slice(0, 8).map((column) => (
              <li key={column.href}>
                <Link href={column.href} className="hover:text-home dark:hover:text-white">
                  {categoryLabel(column)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/10 dark:border-white/10">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-ink/50 dark:text-cream/50">
          <p>© {new Date().getFullYear()} ITS Group</p>
          <div className="flex gap-4">
            <Link href="/za-nas" className="hover:text-ink dark:hover:text-cream">
              {dict.nav.about}
            </Link>
            <Link href="/kontakt" className="hover:text-ink dark:hover:text-cream">
              {dict.nav.contact}
            </Link>
            <Link href="/katalog" className="hover:text-ink dark:hover:text-cream">
              {dict.nav.catalog}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
