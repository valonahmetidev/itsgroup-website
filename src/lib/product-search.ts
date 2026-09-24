import { categoryDisplayName } from "@/lib/i18n/catalog-labels";
import type { Locale } from "@/lib/i18n";
import type { CatalogSource, Product } from "@/lib/types";

export function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s./+-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseSearchTerms(query: string) {
  return normalizeSearchText(query).split(" ").filter(Boolean);
}

function buildProductHaystack(product: Product, locale: Locale) {
  const categoryNames = product.categories.map((category) =>
    categoryDisplayName(
      { source: product.source as CatalogSource, slug: category.slug, name: category.name },
      locale,
    ),
  );

  return normalizeSearchText(
    [
      product.name,
      product.names?.mk,
      product.names?.en,
      product.names?.sq,
      product.excerpt,
      product.slug,
      String(product.id),
      product.source === "its" ? "its group itsgroup" : product.source,
      ...categoryNames,
      ...product.categories.map((category) => category.name),
      ...(product.types?.map((type) => type.name) ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function scoreProductMatch(product: Product, terms: string[], locale: Locale) {
  if (terms.length === 0) return 0;

  const haystack = buildProductHaystack(product, locale);
  const name = normalizeSearchText(product.name);
  const phrase = terms.join(" ");

  let score = 0;

  if (name === phrase) score += 220;
  else if (name.startsWith(phrase)) score += 180;
  else if (name.includes(phrase)) score += 140;

  const matchedTerms = terms.filter((term) => haystack.includes(term));
  if (matchedTerms.length === 0) return 0;

  if (matchedTerms.length < terms.length) {
    if (terms.length === 1 && termMatchesFuzzy(haystack, terms[0])) {
      score += 35;
    } else {
      return 0;
    }
  } else {
    score += matchedTerms.length * 40;
  }

  for (const term of matchedTerms) {
    if (name === term) score += 60;
    else if (name.startsWith(term)) score += 35;
    else if (name.includes(term)) score += 20;

    if (String(product.id) === term) score += 80;
    if (normalizeSearchText(product.slug).includes(term)) score += 15;
  }

  if (product.inStock) score += 3;
  if (product.image) score += 2;
  if (product.source === "its") score += 30;

  return score;
}

function termMatchesFuzzy(haystack: string, term: string) {
  if (term.length < 3) return false;
  if (haystack.includes(term)) return true;

  const words = haystack.split(" ").filter(Boolean);
  return words.some((word) => word.startsWith(term) || levenshteinAtMost(word, term, 1));
}

function levenshteinAtMost(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return false;
  if (a === b) return true;
  if (a.length === 0 || b.length === 0) return false;

  const prev = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let prevDiagonal = prev[0];
    prev[0] = i;
    let rowMin = prev[0];
    for (let j = 1; j <= b.length; j += 1) {
      const temp = prev[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, prevDiagonal + cost);
      prevDiagonal = temp;
      rowMin = Math.min(rowMin, prev[j]);
    }
    if (rowMin > max) return false;
  }
  return prev[b.length] <= max;
}

export function searchAndRankProducts(products: Product[], query: string, locale: Locale, limit?: number) {
  const terms = parseSearchTerms(query);
  if (!terms.length) return products;

  const ranked: { product: Product; score: number }[] = [];
  for (const product of products) {
    const score = scoreProductMatch(product, terms, locale);
    if (score > 0) ranked.push({ product, score });
  }

  ranked.sort(
    (a, b) =>
      b.score - a.score ||
      a.product.name.localeCompare(b.product.name, locale, { sensitivity: "base" }),
  );

  const list = ranked.map((entry) => entry.product);
  return limit != null ? list.slice(0, limit) : list;
}
