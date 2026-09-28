"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ClipboardList, LogOut, Menu, MoreHorizontal, User, X } from "lucide-react";
import { customerLogout } from "@/app/customer/actions";
import { CustomerNav } from "@/components/CustomerNav";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { useLocale } from "@/components/LocaleProvider";
import { SearchBox } from "@/components/SearchBox";
import { useInquiry } from "@/components/Inquiry";
import { cn } from "@/lib/cn";
import { useCategoryLabel } from "@/lib/i18n/catalog-labels";
import { menuGroupTitle } from "@/lib/i18n/menu";
import type { MenuColumn, MenuGroup, MenuLink } from "@/lib/types";

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

  useEffect(() => {
    setMobile(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobile) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobile(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.removeProperty("overflow");
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
      <div className="shell flex h-[4.5rem] items-center gap-2 sm:h-[4.75rem]">
        <Logo href="/" variant="header" className="mr-0.5 shrink-0 sm:mr-1" />

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
          <MoreNav links={moreLinks} pathname={pathname} />
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <SearchBox expandable onNavigate={() => setMobile(false)} />

          <CustomerNav profile={customer} />
          <WhatsAppCta variant="header" />
          <CurrencySwitcher className="hidden shrink-0 lg:flex" compact />
          <LanguageSwitcher className="hidden shrink-0 lg:flex" compact />
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

      {mobile &&
        createPortal(
          <MobileMenu
            customer={customer}
            allLinks={allLinks}
            techGroups={treco}
            homeGroups={tremark}
            categoryLabel={categoryLabel}
            quoteCount={items.length}
            onClose={() => setMobile(false)}
          />,
          document.body,
        )}
    </header>
  );
}

function MobileMenu({
  customer,
  allLinks,
  techGroups,
  homeGroups,
  categoryLabel,
  quoteCount,
  onClose,
}: {
  customer: { name: string; discountPercent: number | null } | null;
  allLinks: { href: string; label: string }[];
  techGroups: MenuGroup[];
  homeGroups: MenuGroup[];
  categoryLabel: (category: MenuColumn | MenuLink) => string;
  quoteCount: number;
  onClose: () => void;
}) {
  const { dict } = useLocale();

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-card lg:hidden">
      <div className="shell flex h-16 shrink-0 items-center justify-between border-b border-ink/10">
        <Logo href="/" variant="header" />
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface"
          aria-label={dict.nav.menu}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
        {customer ? (
          <div className="mb-4 rounded-2xl border border-ink/10 bg-surface p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tech/15 text-tech">
                <User className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug">{customer.name}</p>
                {customer.discountPercent != null && (
                  <p className="mt-1 text-sm text-tech">
                    {dict.customer.yourDiscount}: -{customer.discountPercent}%
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void customerLogout()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ink/10 px-4 py-2.5 text-sm font-semibold transition hover:border-home hover:text-home"
            >
              <LogOut className="h-4 w-4" />
              {dict.customer.logout}
            </button>
          </div>
        ) : (
          <Link
            href="/najava"
            onClick={onClose}
            className="mb-4 flex items-center gap-3 rounded-2xl border border-ink/10 bg-surface p-4 transition hover:border-tech"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tech/15 text-tech">
              <User className="h-5 w-5" />
            </span>
            <span className="font-semibold">{dict.customer.loginButton}</span>
          </Link>
        )}

        <div className="mb-4">
          <WhatsAppCta variant="primary" className="w-full" />
        </div>

        <Link
          href="/ponuda"
          onClick={onClose}
          className="mb-4 flex items-center justify-between rounded-2xl border border-ink/10 bg-surface px-4 py-3 font-semibold transition hover:border-tech"
        >
          <span className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-tech" />
            {dict.nav.quote}
          </span>
          {quoteCount > 0 && (
            <span className="rounded-full bg-home px-2 py-0.5 text-xs font-bold text-white">{quoteCount}</span>
          )}
        </Link>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <CurrencySwitcher compact />
          <LanguageSwitcher compact />
          <ThemeToggle />
        </div>

        <nav className="flex flex-col border-t border-ink/10">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="border-b border-ink/10 py-3 text-lg font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <MobileCategorySection
          title={dict.nav.technology}
          href="/tehnologija"
          groups={techGroups}
          label={categoryLabel}
          onNavigate={onClose}
        />
        <MobileCategorySection
          title={dict.nav.home}
          href="/dom"
          groups={homeGroups}
          label={categoryLabel}
          onNavigate={onClose}
        />
      </div>
    </div>
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
  const ref = useRef<HTMLDetailsElement>(null);
  const active = links.some((link) => pathname === link.href || pathname.startsWith(`${link.href}/`));

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

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
      <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[10rem] max-w-[min(100vw-2.5rem,14rem)] rounded-2xl border border-ink/10 bg-card p-2 shadow-lift">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => {
              if (ref.current) ref.current.open = false;
            }}
            className={cn(
              "block rounded-xl px-3 py-2 text-sm leading-snug hover:bg-paper",
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
  groups,
  label,
  onNavigate,
}: {
  title: string;
  href: string;
  groups: MenuGroup[];
  label: (category: MenuColumn | MenuLink) => string;
  onNavigate: () => void;
}) {
  const { dict } = useLocale();

  return (
    <details className="group mt-3 rounded-2xl border border-ink/10 bg-paper">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink/40 transition group-open:rotate-180" />
      </summary>
      <div className="space-y-1 border-t border-ink/10 px-2 pb-3 pt-2">
        <Link href={href} onClick={onNavigate} className="mx-2 mb-1 block rounded-xl px-2 py-2 text-sm font-semibold text-tech">
          {dict.nav.allDivisions}
        </Link>
        {groups.map((group) => (
          <details key={group.key} className="group/sub rounded-xl">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-surface [&::-webkit-details-marker]:hidden">
              <span className="min-w-0">{menuGroupTitle(dict, group.key, group.title)}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink/35 transition group-open/sub:rotate-180" />
            </summary>
            <div className="space-y-0.5 pb-2 pl-1">
              {group.columns.map((column) => (
                <MobileCategoryColumn key={column.href} column={column} label={label} onNavigate={onNavigate} />
              ))}
            </div>
          </details>
        ))}
      </div>
    </details>
  );
}

function MobileCategoryColumn({
  column,
  label,
  onNavigate,
}: {
  column: MenuColumn;
  label: (category: MenuColumn | MenuLink) => string;
  onNavigate: () => void;
}) {
  if (column.children.length === 0) {
    return (
      <Link
        href={column.href}
        onClick={onNavigate}
        className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm hover:bg-surface"
      >
        <span className="min-w-0 leading-5">{label(column)}</span>
        <span className="shrink-0 text-xs tabular-nums text-ink/40">{column.count}</span>
      </Link>
    );
  }

  return (
    <details className="group/col rounded-lg">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 font-medium leading-5">{label(column)}</span>
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-ink/40">
          <span className="tabular-nums">{column.count}</span>
          <ChevronDown className="h-3 w-3 transition group-open/col:rotate-180" />
        </span>
      </summary>
      <div className="space-y-0.5 border-l border-ink/10 py-1 pl-3">
        {column.children.map((child) => (
          <MobileCategoryLink key={child.href} link={child} label={label} onNavigate={onNavigate} depth={0} />
        ))}
      </div>
    </details>
  );
}

function MobileCategoryLink({
  link,
  label,
  onNavigate,
  depth,
}: {
  link: MenuLink;
  label: (category: MenuColumn | MenuLink) => string;
  onNavigate: () => void;
  depth: number;
}) {
  if (link.children.length === 0) {
    return (
      <Link
        href={link.href}
        onClick={onNavigate}
        className="flex items-center justify-between gap-2 rounded-lg py-1.5 pr-2 text-[13px] hover:text-tech"
        style={{ paddingLeft: depth > 0 ? 12 : 8 }}
      >
        <span className="min-w-0">{label(link)}</span>
        <span className="shrink-0 text-xs text-ink/35">{link.count}</span>
      </Link>
    );
  }

  return (
    <details className="group/link rounded-lg" style={{ marginLeft: depth > 0 ? 8 : 0 }}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-1.5 pr-2 text-[13px] [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 font-medium">{label(link)}</span>
        <ChevronDown className="h-3 w-3 shrink-0 text-ink/35 transition group-open/link:rotate-180" />
      </summary>
      <div className="border-l border-ink/10 pl-2">
        {link.children.map((child) => (
          <MobileCategoryLink key={child.href} link={child} label={label} onNavigate={onNavigate} depth={depth + 1} />
        ))}
      </div>
    </details>
  );
}
