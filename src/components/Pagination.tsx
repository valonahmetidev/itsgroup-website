"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
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
  const { dict } = useLocale();

  if (pages <= 1) return null;
  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(pages, windowStart + 4);
  const numbers = [];
  for (let number = windowStart; number <= windowEnd; number += 1) numbers.push(number);

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pages">
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
