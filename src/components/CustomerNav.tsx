"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { customerLogout } from "@/app/customer/actions";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";

export function CustomerNav({
  profile,
}: {
  profile: { name: string; discountPercent: number | null } | null;
}) {
  const { dict } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  if (!profile) {
    return (
      <Link
        href="/najava"
        className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-surface hover:bg-paper md:inline-flex"
        aria-label={dict.customer.loginButton}
        title={dict.customer.loginButton}
      >
        <User className="h-4 w-4" />
      </Link>
    );
  }

  const firstName = profile.name.trim().split(/\s+/)[0] ?? profile.name;

  return (
    <div ref={rootRef} className="relative hidden shrink-0 md:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative flex h-9 items-center gap-1.5 rounded-full border border-ink/10 bg-surface text-xs font-medium transition hover:bg-paper",
          open && "border-tech/40",
          "w-9 justify-center px-0 xl:w-auto xl:max-w-[9rem] xl:justify-start xl:px-2.5",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        title={profile.discountPercent ? `${profile.name} · -${profile.discountPercent}%` : profile.name}
      >
        <User className="h-4 w-4 shrink-0 text-tech" />
        <span className="hidden truncate xl:inline">{firstName}</span>
        {profile.discountPercent ? (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-tech xl:hidden" aria-hidden />
        ) : null}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[11rem] rounded-2xl border border-ink/10 bg-card p-2 shadow-lift"
        >
          <p className="px-3 py-2 text-sm font-semibold leading-snug">{profile.name}</p>
          {profile.discountPercent ? (
            <p className="px-3 pb-2 text-xs text-ink/55">-{profile.discountPercent}%</p>
          ) : null}
          <Link
            href="/profil"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm hover:bg-paper"
          >
            {dict.customer.profile}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void customerLogout()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-paper"
          >
            <LogOut className="h-4 w-4 text-ink/50" />
            {dict.customer.logout}
          </button>
        </div>
      )}
    </div>
  );
}
