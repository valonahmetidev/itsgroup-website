"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ClipboardList, Menu, MoreHorizontal, X } from "lucide-react";
import { CustomerNav } from "@/components/CustomerNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { useLocale } from "@/components/LocaleProvider";
import { SearchBox } from "@/components/SearchBox";
import { useInquiry } from "@/components/Inquiry";
import { cn } from "@/lib/cn";
import { useCategoryLabel } from "@/lib/i18n/catalog-labels";
import type { MenuColumn, MenuGroup } from "@/lib/types";

function flatColumns(groups: MenuGroup[]) {
  return groups.flatMap((group) => group.columns);
}

export function Header({
  treco,
  tremark,
  customer,
}: {
  treco: MenuGroup[];
  tremark: MenuGroup[];
  customer: { name: string; discountPercent: number | null } | null;
}) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const { items } = useInquiry();
  const { dict } = useLocale();
  const categoryLabel = useCategoryLabel();
  const [mobile, setMobile] = useState(false);
  const techCategories = flatColumns(treco);
  const homeCategories = flatColumns(tremark);

  useEffect(() => {
    setMobile(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobile) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobile(false);
    }
    function onPointer(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setMobile(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [mobile]);

  const coreLinks = [
    { href: "/katalog", label: dict.nav.catalog },
    { href: "/tehnologija", label: dict.nav.technology },
    { href: "/dom", label: dict.nav.home },
  ];

  const moreLinks = [
    { href: "/za-nas", label: dict.nav.about },
    { href: "/kontakt", label: dict.nav.contact },
  ];

  const allLinks = [...coreLinks, ...moreLinks];

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur-xl">
      <div className="shell flex h-16 items-center gap-2">
        <Logo href="/" variant="header" className="mr-1 shrink-0" />

        <nav className="hidden min-w-0 items-center gap-0.5 lg:flex" aria-label={dict.nav.menu}>
          {coreLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              active={pathname === link.href || pathname.startsWith(`${link.href}/`)}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="hidden 2xl:contents">
            {moreLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                active={pathname === link.href || pathname.startsWith(`${link.href}/`)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <MoreNav links={moreLinks} pathname={pathname} className="2xl:hidden" />
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <div className="relative hidden lg:block 2xl:hidden">
            <SearchBox expandable />
          </div>
          <div className="relative hidden w-44 shrink-0 2xl:block 2xl:w-52">
            <SearchBox />
          </div>

          <CustomerNav profile={customer} />
          <LanguageSwitcher className="hidden shrink-0 lg:flex" />
          <ThemeToggle className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-surface lg:inline-flex" />

          <Link
            href="/ponuda"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-surface"
            aria-label={dict.nav.quote}
          >
            <ClipboardList className="h-[1.125rem] w-[1.125rem]" />
            {items.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-home px-0.5 text-[10px] font-bold text-white">
                {items.length}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-surface lg:hidden"
            onClick={() => setMobile((value) => !value)}
            aria-label={dict.nav.menu}
            aria-expanded={mobile}
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobile && (
        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-ink/10 bg-card px-5 py-4 lg:hidden">
          <SearchBox onNavigate={() => setMobile(false)} />

          <div className="mt-4 flex items-center gap-2">
            <LanguageSwitcher compact />
            <ThemeToggle />
          </div>

          <nav className="mt-4 flex flex-col border-t border-ink/10">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobile(false)}
                className="border-b border-ink/10 py-3 text-lg font-medium"
              >
                {link.label}
              </Link>
            ))}
            {!customer && (
              <Link href="/najava" onClick={() => setMobile(false)} className="border-b border-ink/10 py-3 text-lg font-medium">
                {dict.customer.loginButton}
              </Link>
            )}
          </nav>

          <MobileCategorySection
            title={dict.nav.technology}
            href="/tehnologija"
            categories={techCategories}
            label={categoryLabel}
            onNavigate={() => setMobile(false)}
          />
          <MobileCategorySection
            title={dict.nav.home}
            href="/dom"
            categories={homeCategories}
            label={categoryLabel}
            onNavigate={() => setMobile(false)}
          />
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition",
        active ? "bg-ink text-paper" : "text-ink/80 hover:bg-surface hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}

function MoreNav({
  links,
  pathname,
  className,
}: {
  links: { href: string; label: string }[];
  pathname: string;
  className?: string;
}) {
  const { dict } = useLocale();
  const ref = useRef<HTMLDetailsElement>(null);
  const active = links.some((link) => pathname === link.href || pathname.startsWith(`${link.href}/`));

  return (
    <details ref={ref} className={cn("relative", className)}>
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition [&::-webkit-details-marker]:hidden",
          active ? "bg-ink text-paper" : "text-ink/80 hover:bg-surface hover:text-ink",
        )}
        aria-label="More"
      >
        <MoreHorizontal className="h-4 w-4" />
      </summary>
      <div className="absolute left-0 top-[calc(100%+8px)] z-50 min-w-[10rem] rounded-2xl border border-ink/10 bg-card p-2 shadow-lift">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => {
              if (ref.current) ref.current.open = false;
            }}
            className={cn(
              "block whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-paper",
              pathname === link.href || pathname.startsWith(`${link.href}/`) ? "font-semibold text-tech" : "",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

function MobileCategorySection({
  title,
  href,
  categories,
  label,
  onNavigate,
}: {
  title: string;
  href: string;
  categories: MenuColumn[];
  label: (category: MenuColumn) => string;
  onNavigate: () => void;
}) {
  const { dict } = useLocale();

  return (
    <details className="group mt-3 rounded-2xl bg-paper">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink/40 transition group-open:rotate-180" />
      </summary>
      <div className="space-y-0.5 px-2 pb-3">
        <Link href={href} onClick={onNavigate} className="mx-2 mb-2 block rounded-xl px-2 py-2 text-sm font-semibold text-tech">
          {dict.nav.allDivisions}
        </Link>
        {categories.map((column) => (
          <Link
            key={column.href}
            href={column.href}
            onClick={onNavigate}
            className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm hover:bg-surface"
          >
            <span className="min-w-0 leading-5">{label(column)}</span>
            <span className="shrink-0 text-xs tabular-nums text-ink/40">{column.count}</span>
          </Link>
        ))}
      </div>
    </details>
  );
}
