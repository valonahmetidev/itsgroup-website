"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { adminLogout } from "@/app/admin/auth-actions";
import { AdminLocaleSwitcher } from "@/components/admin/AdminLocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", labelKey: "dashboard" as const },
  { href: "/admin/products", labelKey: "products" as const },
  { href: "/admin/categories", labelKey: "categories" as const },
  { href: "/admin/custom", labelKey: "custom" as const },
  { href: "/admin/customers", labelKey: "customers" as const },
  { href: "/admin/proformas", labelKey: "proformas" as const },
  { href: "/admin/inquiries", labelKey: "inquiries" as const },
];

function navLinkClass(pathname: string, href: string, compact = false) {
  const active =
    pathname === href || (href !== "/admin" && (pathname.startsWith(`${href}/`) || pathname === href));
  return cn(
    compact
      ? "block rounded-xl px-3 py-3 text-base font-medium transition"
      : "rounded-full px-3 py-1 text-sm font-medium sm:px-3",
    compact
      ? active
        ? "bg-ink text-paper"
        : "hover:bg-surface"
      : active
        ? "bg-ink text-paper"
        : "bg-surface hover:bg-ink/5",
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dict } = useLocale();
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

  return (
    <div className="min-h-screen min-w-0 bg-paper">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-card/95 backdrop-blur supports-[padding:max(0px)]:pt-[max(0px,env(safe-area-inset-top))]">
        <div className="shell flex min-w-0 items-center gap-2 py-2 sm:gap-3">
          <p className="min-w-0 shrink font-display text-sm sm:text-base">{dict.admin.panel}</p>

          <nav className="hidden min-w-0 flex-1 flex-wrap items-center gap-1 lg:flex" aria-label={dict.admin.panel}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass(pathname, link.href)}>
                {dict.admin[link.labelKey]}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => void adminLogout()}
              className="rounded-full border border-ink/10 px-3 py-1 text-sm font-medium hover:border-home hover:text-home"
            >
              {dict.admin.logout}
            </button>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <AdminLocaleSwitcher />
            <ThemeToggle className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 bg-surface hover:bg-paper" />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-surface hover:bg-paper lg:hidden"
              onClick={() => setMobile((open) => !open)}
              aria-label={dict.nav.menu}
              aria-expanded={mobile}
            >
              {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobile &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex flex-col bg-card pt-[env(safe-area-inset-top)] lg:hidden">
            <div className="shell flex h-14 shrink-0 items-center justify-between border-b border-ink/10">
              <p className="font-display text-base">{dict.admin.panel}</p>
              <button
                type="button"
                onClick={() => setMobile(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface"
                aria-label={dict.nav.menu}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
              aria-label={dict.admin.panel}
            >
              <ul className="flex flex-col gap-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={() => setMobile(false)} className={navLinkClass(pathname, link.href, true)}>
                      {dict.admin[link.labelKey]}
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => void adminLogout()}
                className="mt-4 w-full rounded-full border border-home/30 px-4 py-3 text-sm font-semibold text-home hover:border-home"
              >
                {dict.admin.logout}
              </button>
            </nav>
          </div>,
          document.body,
        )}

      <div className="shell min-w-0 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:py-5">{children}</div>
    </div>
  );
}
