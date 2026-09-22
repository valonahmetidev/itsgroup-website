import { CatalogView } from "@/components/CatalogView";
import { products, searchProducts } from "@/lib/catalog";
import type { CatalogQuery, Product, Source } from "@/lib/types";

const PAGE_SIZE = 24;

type SearchParams = {
  q?: string;
  source?: string;
  sort?: string;
  page?: string;
};

function parseQuery(search: SearchParams): Required<Pick<CatalogQuery, "q" | "source" | "sort" | "page">> {
  const source: CatalogQuery["source"] =
    search.source === "treco" || search.source === "tremark" ? search.source : "all";
  const sort: CatalogQuery["sort"] =
    search.sort === "price-asc" || search.sort === "price-desc" ? search.sort : "name";
  return {
    q: search.q?.trim() ?? "",
    source,
    sort,
    page: Math.max(1, Number(search.page) || 1),
  };
}

function sortProducts(list: Product[], sort: CatalogQuery["sort"]) {
  const copy = [...list];
  if (sort === "price-asc" || sort === "price-desc") {
    const direction = sort === "price-asc" ? 1 : -1;
    copy.sort((a, b) => {
      if (a.price == null && b.price == null) return a.name.localeCompare(b.name, "mk");
      if (a.price == null) return 1;
      if (b.price == null) return -1;
      return (a.price - b.price) * direction;
    });
    return copy;
  }
  copy.sort((a, b) => a.name.localeCompare(b.name, "mk"));
  return copy;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = parseQuery(await searchParams);
  const source = query.source === "all" ? undefined : (query.source as Source);
  const matched = sortProducts(
    query.q ? searchProducts(query.q, source) : products.filter((product) => !source || product.source === source),
    query.sort,
  );
  const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const visible = matched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return <CatalogView query={query} total={matched.length} page={page} pages={pages} visible={visible} />;
}
