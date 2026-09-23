"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { fill } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export function Pagination({
  page,
  pages,
  hrefFor,
}: {
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
}) {
  const router = useRouter();
  const { dict } = useLocale();
  const [jumpValue, setJumpValue] = useState("");

  if (pages < 1) return null;

  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(pages, windowStart + 4);
  const numbers = [];
  for (let number = windowStart; number <= windowEnd; number += 1) numbers.push(number);

  function submitJump(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = Math.round(Number(jumpValue));
    if (!Number.isFinite(next) || next < 1 || next > pages || next === page) return;
    router.push(hrefFor(next));
    setJumpValue("");
  }

  return (
    <div className="mt-8 space-y-4">
      <p className="text-center text-sm font-medium text-ink/60">
        {fill(dict.pagination.pageOf, { page, pages })}
      </p>

      {pages > 1 && (
        <>
          <nav className="flex flex-wrap items-center justify-center gap-2" aria-label={dict.pagination.label}>
            <PageLink href={hrefFor(page - 1)} disabled={page <= 1}>
              {dict.pagination.prev}
            </PageLink>
            {numbers.map((number) => (
              <Link
                key={number}
                href={hrefFor(number)}
                className={cn(
                  "flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm",
                  number === page ? "bg-ink text-paper" : "bg-surface hover:bg-ink/5",
                )}
                aria-current={number === page ? "page" : undefined}
              >
                {number}
              </Link>
            ))}
            <PageLink href={hrefFor(page + 1)} disabled={page >= pages}>
              {dict.pagination.next}
            </PageLink>
          </nav>

          <form
            onSubmit={submitJump}
            className="flex flex-wrap items-center justify-center gap-2 text-sm"
          >
            <label className="text-ink/60" htmlFor="pagination-jump">
              {dict.pagination.goToPage}
            </label>
            <input
              id="pagination-jump"
              type="number"
              min={1}
              max={pages}
              inputMode="numeric"
              value={jumpValue}
              onChange={(event) => setJumpValue(event.target.value)}
              placeholder={String(page)}
              className="w-20 rounded-full border border-ink/10 bg-surface px-3 py-2 text-center outline-none transition focus:border-tech"
            />
            <button
              type="submit"
              className="rounded-full bg-tech px-4 py-2 font-semibold text-cream transition hover:opacity-90"
            >
              {dict.pagination.go}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  if (disabled) {
    return <span className="rounded-full px-3 py-2 text-sm text-ink/30">{children}</span>;
  }
  return (
    <Link href={href} className="rounded-full bg-surface px-3 py-2 text-sm hover:bg-ink/5">
      {children}
    </Link>
  );
}
