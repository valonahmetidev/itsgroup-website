"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { findProducts } from "@/app/actions";
import { useLocale } from "@/components/LocaleProvider";
import { catalogHref } from "@/lib/format";

type Result = {
  href: string;
  name: string;
  price: string;
  brand: string;
  image: string | null;
};

export function SearchBox({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const { dict } = useLocale();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = window.setTimeout(() => {
      void findProducts(query).then(setResults);
    }, 180);
    return () => window.clearTimeout(handle);
  }, [query]);

  return (
    <form
      className="relative"
      onSubmit={(event) => {
        event.preventDefault();
        const next = query.trim();
        if (!next) return;
        onNavigate?.();
        router.push(catalogHref({ q: next }));
      }}
    >
      <label className="sr-only" htmlFor="catalog-search">
        {dict.search.label}
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
      <input
        id="catalog-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={dict.search.placeholder}
        className="w-full rounded-full border border-ink/10 bg-surface py-3 pl-11 pr-4 text-sm outline-none transition focus:border-tech"
      />
      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-lift">
          {results.map((result) => (
            <Link
              key={result.href}
              href={result.href}
              onClick={onNavigate}
              className="flex items-center gap-3 px-3 py-2 hover:bg-paper"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-paper">
                {result.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.image} alt="" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs text-ink/40">ITS</span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{result.name}</span>
                <span className="text-xs text-ink/50">
                  {result.brand} · {result.price}
                </span>
              </span>
            </Link>
          ))}
          <Link
            href={catalogHref({ q: query.trim() })}
            onClick={onNavigate}
            className="block border-t border-ink/10 px-4 py-3 text-sm font-semibold text-tech"
          >
            {dict.search.allResults}
          </Link>
        </div>
      )}
    </form>
  );
}
