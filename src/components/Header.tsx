"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ClipboardList, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { useLocale } from "@/components/LocaleProvider";
import { SearchBox } from "@/components/SearchBox";
import { useInquiry } from "@/components/Inquiry";
import { cn } from "@/lib/cn";
import { countProducts } from "@/lib/format";
import { menuGroupTitle } from "@/lib/i18n/menu";
import type { MenuColumn, MenuGroup, MenuLink, Source } from "@/lib/types";

export function Header({
  treco,
  tremark,
}: {
  treco: MenuGroup[];
  tremark: MenuGroup[];
}) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const { items } = useInquiry();
  const { dict } = useLocale();
  const [open, setOpen] = useState<Source | null>(null);
  const [groupIndex, setGroupIndex] = useState(0);
  const [columnIndex, setColumnIndex] = useState(0);
  const [mobile, setMobile] = useState(false);
  const groups = open === "treco" ? treco : open === "tremark" ? tremark : [];
  const activeGroup = groups[groupIndex] ?? groups[0];
  const activeColumn = activeGroup?.columns[columnIndex] ?? activeGroup?.columns[0];

  useEffect(() => {
    setOpen(null);
    setMobile(false);
    setGroupIndex(0);
    setColumnIndex(0);
  }, [pathname]);

  useEffect(() => {
    if (!open && !mobile) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(null);
      setMobile(false);
    }
    function onPointer(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpen(null);
        setMobile(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, mobile]);

  function toggleMenu(source: Source) {
    setGroupIndex(0);
    setColumnIndex(0);
    setOpen(open === source ? null : source);
  }

  const mobileLinks = [
    ["/katalog", dict.nav.catalog],
    ["/tehnologija", dict.nav.technology],
    ["/dom", dict.nav.home],
    ["/za-nas", dict.nav.about],
    ["/kontakt", dict.nav.contact],
  ];

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur-xl">
      <div className="shell flex h-[4.75rem] items-center gap-2 md:gap-3">
        <Logo href="/" variant="header" className="mr-2 shrink-0" />

        <nav className="hidden items-center gap-1 lg:flex">
          <NavButton active={open === "treco"} onClick={() => toggleMenu("treco")}>
            {dict.nav.technology}
          </NavButton>
          <NavButton active={open === "tremark"} onClick={() => toggleMenu("tremark")}>
            {dict.nav.home}
          </NavButton>
          <Link href="/katalog" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-surface">
            {dict.nav.catalog}
          </Link>
          <Link href="/za-nas" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-surface">
            {dict.nav.about}
          </Link>
          <Link href="/kontakt" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-surface">
            {dict.nav.contact}
          </Link>
        </nav>

        <div className="ml-auto hidden w-56 xl:block">
          <SearchBox />
        </div>

        <LanguageSwitcher className="hidden md:flex" />
        <ThemeToggle className="hidden rounded-full p-2 hover:bg-surface md:inline-flex" />

        <Link href="/ponuda" className="relative rounded-full p-2 hover:bg-surface" aria-label={dict.nav.quote}>
          <ClipboardList className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-home px-1 text-[11px] font-bold text-white">
              {items.length}
            </span>
          )}
        </Link>
        <button type="button" className="rounded-full p-2 hover:bg-surface lg:hidden" onClick={() => setMobile((value) => !value)} aria-label={dict.nav.menu}>
          {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && activeGroup && activeColumn && (
        <div className="hidden border-t border-ink/10 bg-card lg:block">
          <div className="shell flex max-h-[min(68vh,540px)] flex-col py-4">
            {groups.length > 1 && (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {groups.map((group, index) => (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => {
                      setGroupIndex(index);
                      setColumnIndex(0);
                    }}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-medium",
                      index === groupIndex ? "bg-ink text-paper" : "bg-surface text-ink/70 hover:text-ink",
                    )}
                  >
                    {menuGroupTitle(dict, group.key, group.title)}
                  </button>
                ))}
                <Link href={open === "treco" ? "/tehnologija" : "/dom"} className="ml-auto text-sm font-semibold text-tech">
                  {dict.nav.allDivisions}
                </Link>
              </div>
            )}

            <div className={cn("grid min-h-0 flex-1 grid-cols-[minmax(200px,260px)_1fr] gap-4 overflow-hidden", groups.length > 1 && "mt-4")}>
              <div className="overflow-y-auto pr-1">
                {activeGroup.columns.map((column, index) => (
                  <Link
                    key={column.href}
                    href={column.href}
                    onMouseEnter={() => setColumnIndex(index)}
                    onFocus={() => setColumnIndex(index)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm",
                      index === columnIndex ? "bg-ink text-paper" : "hover:bg-surface",
                    )}
                  >
                    <span className="min-w-0 leading-5">{column.title}</span>
                    <span className={cn("shrink-0 text-xs tabular-nums", index === columnIndex ? "text-paper/60" : "text-ink/40")}>
                      {column.count}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="overflow-y-auto rounded-2xl bg-surface p-4">
                <div className="flex items-end justify-between gap-3 border-b border-ink/10 pb-3">
                  <Link href={activeColumn.href} className="font-display text-2xl leading-none hover:text-tech">
                    {activeColumn.title}
                  </Link>
                  <span className="flex shrink-0 items-center gap-4">
                    {groups.length === 1 && (
                      <Link href={open === "treco" ? "/tehnologija" : "/dom"} className="text-sm font-semibold text-tech">
                        {dict.nav.allDivisions}
                      </Link>
                    )}
                    <span className="text-sm text-ink/45">{countProducts(activeColumn.count, dict)}</span>
                  </span>
                </div>
                {activeColumn.children.length > 0 ? (
                  <div className="mt-3 grid content-start gap-1 sm:grid-cols-2">
                    {activeColumn.children.map((child) => (
                      <CategoryRow key={child.href} link={child} />
                    ))}
                  </div>
                ) : (
                  <Link href={activeColumn.href} className="mt-4 inline-flex text-sm font-semibold text-tech">
                    {dict.catalog.all}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {mobile && (
        <div className="max-h-[calc(100vh-4.75rem)] space-y-4 overflow-y-auto border-t border-ink/10 bg-card px-5 py-4 lg:hidden">
          <SearchBox onNavigate={() => setMobile(false)} />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <div className="flex flex-col">
            {mobileLinks.map(([href, label]) => (
              <Link key={href} href={href} className="border-b border-ink/10 py-2.5 text-lg font-medium">
                {label}
              </Link>
            ))}
          </div>
          {[...treco, ...tremark].map((group) => (
            <MobileGroup key={group.key} group={group} allLabel={dict.catalog.all} />
          ))}
        </div>
      )}
    </header>
  );
}

function CategoryRow({ link }: { link: MenuLink }) {
  const nested = link.children.slice(0, 4);
  const extra = link.children.length - nested.length;

  return (
    <div className="rounded-xl px-3 py-2 hover:bg-paper">
      <Link href={link.href} className="flex items-baseline justify-between gap-3 text-sm font-medium hover:text-tech">
        <span className="min-w-0 leading-5">{link.name}</span>
        <span className="shrink-0 text-xs font-normal tabular-nums text-ink/40">{link.count}</span>
      </Link>
      {nested.length > 0 && (
        <p className="mt-1 text-xs leading-5 text-ink/50">
          {nested.map((item, index) => (
            <span key={item.href}>
              {index > 0 && <span className="text-ink/25"> · </span>}
              <Link href={item.href} className="hover:text-tech">
                {item.name}
              </Link>
            </span>
          ))}
          {extra > 0 && <span className="text-ink/30"> · +{extra}</span>}
        </p>
      )}
    </div>
  );
}

function MobileGroup({ group, allLabel }: { group: MenuGroup; allLabel: string }) {
  const { dict } = useLocale();

  return (
    <details className="group rounded-2xl bg-paper px-3 py-2">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
        {menuGroupTitle(dict, group.key, group.title)}
        <ChevronDown className="h-4 w-4 shrink-0 text-ink/40 transition group-open:rotate-180" />
      </summary>
      <div className="mt-2 space-y-1">
        {group.columns.map((column) => (
          <MobileColumn key={column.href} column={column} allLabel={allLabel} />
        ))}
      </div>
    </details>
  );
}

function MobileColumn({ column, allLabel }: { column: MenuColumn; allLabel: string }) {
  if (column.children.length === 0) {
    return (
      <Link href={column.href} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 text-sm hover:bg-surface">
        <span>{column.title}</span>
        <span className="text-xs tabular-nums text-ink/40">{column.count}</span>
      </Link>
    );
  }

  return (
    <details className="group/column rounded-xl px-2 py-1">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">{column.title}</span>
        <span className="flex shrink-0 items-center gap-2 text-xs font-normal tabular-nums text-ink/40">
          {column.count}
          <ChevronDown className="h-3.5 w-3.5 transition group-open/column:rotate-180" />
        </span>
      </summary>
      <div className="mb-2 ml-2 border-l border-ink/10 pl-3">
        <Link href={column.href} className="block py-1 text-sm font-semibold text-tech">
          {allLabel}
        </Link>
        {column.children.map((child) => (
          <Link key={child.href} href={child.href} className="flex items-baseline justify-between gap-3 py-1 text-sm text-ink/75 hover:text-tech">
            <span>{child.name}</span>
            <span className="text-xs tabular-nums text-ink/35">{child.count}</span>
          </Link>
        ))}
      </div>
    </details>
  );
}

function NavButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium",
        active ? "bg-ink text-paper" : "hover:bg-surface",
      )}
      aria-expanded={active}
    >
      {children}
      <ChevronDown className={cn("h-3.5 w-3.5 opacity-60 transition", active && "rotate-180")} />
    </button>
  );
}
