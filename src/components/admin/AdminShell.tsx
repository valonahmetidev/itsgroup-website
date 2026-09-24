"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dict } = useLocale();

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-card/95 backdrop-blur">
        <div className="shell flex items-center gap-2 py-2 sm:gap-3">
          <p className="hidden shrink-0 font-display text-base sm:block">{dict.admin.panel}</p>
          <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium sm:px-3 sm:text-sm",
                  pathname === link.href ? "bg-ink text-paper" : "bg-surface hover:bg-ink/5",
                )}
              >
                {dict.admin[link.labelKey]}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => void adminLogout()}
              className="shrink-0 whitespace-nowrap rounded-full border border-ink/10 px-2.5 py-1 text-xs font-medium hover:border-home hover:text-home sm:px-3 sm:text-sm"
            >
              {dict.admin.logout}
            </button>
          </nav>
          <div className="flex shrink-0 items-center gap-1">
            <AdminLocaleSwitcher />
            <ThemeToggle className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 bg-surface hover:bg-paper" />
          </div>
        </div>
      </header>
      <div className="shell py-4 sm:py-5">{children}</div>
    </div>
  );
}
