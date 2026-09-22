"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useLocale } from "@/components/LocaleProvider";
import { menuGroups } from "@/lib/catalog";
import { menuGroupTitle } from "@/lib/i18n/menu";
import { site } from "@/lib/site";

export function Footer() {
  const { dict } = useLocale();
  const tech = menuGroups("treco");
  const home = menuGroups("tremark")[0];

  return (
    <footer className="mt-20 bg-night text-cream">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo href="/" variant="footer" />
          <p className="mt-5 max-w-sm text-sm leading-6 text-cream/70">{dict.footer.text}</p>
          <a href={site.phoneHref} className="mt-4 inline-block text-sm font-medium text-cream hover:text-white">
            {site.phone}
          </a>
          <div className="mt-5 flex gap-4 text-sm">
            <a href="https://treco.mk" className="underline decoration-paper/30 underline-offset-4">
              treco.mk
            </a>
            <a href="https://tremark.mk" className="underline decoration-paper/30 underline-offset-4">
              tremark.mk
            </a>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cream/45">{dict.footer.technology}</p>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            {tech.map((group) => (
              <li key={group.key}>
                <Link href="/tehnologija" className="hover:text-white">
                  {menuGroupTitle(dict, group.key, group.title)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cream/45">{dict.footer.home}</p>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            {home?.columns.slice(0, 8).map((column) => (
              <li key={column.href}>
                <Link href={column.href} className="hover:text-white">
                  {column.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-cream/50">
          <p>© {new Date().getFullYear()} ITS Group</p>
          <div className="flex gap-4">
            <Link href="/za-nas">{dict.nav.about}</Link>
            <Link href="/kontakt">{dict.nav.contact}</Link>
            <Link href="/katalog">{dict.nav.catalog}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
