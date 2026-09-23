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
  { href: "/admin/custom", labelKey: "custom" as const },
  { href: "/admin/customers", labelKey: "customers" as const },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dict } = useLocale();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-card">
        <div className="shell flex flex-col gap-4 py-4 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-tech">{dict.admin.title}</p>
              <h1 className="font-display text-xl sm:text-2xl">{dict.admin.panel}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <AdminLocaleSwitcher />
              <ThemeToggle className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-surface hover:bg-paper" />
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium",
                  pathname === link.href ? "bg-ink text-paper" : "bg-surface hover:bg-ink/5",
                )}
              >
                {dict.admin[link.labelKey]}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => void adminLogout()}
              className="shrink-0 whitespace-nowrap rounded-full border border-ink/10 px-4 py-2 text-sm font-medium hover:border-home hover:text-home"
            >
              {dict.admin.logout}
            </button>
          </nav>
        </div>
      </header>
      <div className="shell py-6 sm:py-8">{children}</div>
    </div>
  );
}
