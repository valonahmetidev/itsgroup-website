import rawCatalog from "../../data/catalog.json";
import { buildCatalogTotals, type CatalogTotals } from "@/lib/catalog-counts";
import { categoryHref } from "@/lib/paths";
import { searchAndRankProducts } from "@/lib/product-search";
import type { Category, CatalogSource, MenuColumn, MenuGroup, MenuLink, Product, Source } from "@/lib/types";

export { categoryHref, productHref } from "@/lib/paths";

type CatalogFile = {
  fetchedAt: string;
  categories: Category[];
  products: Product[];
};

const catalog = rawCatalog as CatalogFile;

const namedEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeText(value: string) {
  if (!value.includes("&") && !/\s{2}|^\s|\s$/.test(value)) return value;
  let text = value;
  for (let pass = 0; pass < 3; pass += 1) {
    const next = text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
      if (entity.startsWith("#")) {
        const codePoint =
          entity[1] === "x" || entity[1] === "X"
            ? Number.parseInt(entity.slice(2), 16)
            : Number.parseInt(entity.slice(1), 10);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
      }
      return namedEntities[entity] ?? match;
    });
    if (next === text) break;
    text = next;
  }
  return text.replace(/\s+/g, " ").trim();
}

function sanitizePublicCatalogText(value: string) {
  return value
    .replace(/\s*[–—-]\s*Достапно за нарачка кај Alevado Energy\.?/gi, "")
    .replace(/\s*[–—-]\s*Available from Alevado Energy\.?/gi, "")
    .replace(/\s*Alevado Energy\s*[–—-]?\s*/gi, " ")
    .replace(/\bAlevado Energy\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanCatalogText(value: string) {
  return sanitizePublicCatalogText(decodeText(value));
}

export const fetchedAt = catalog.fetchedAt;
export const categories = catalog.categories
  .map((category) => ({
    ...category,
    name: cleanCatalogText(category.name),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "mk") || String(a.id).localeCompare(String(b.id)));
function publishedPrice(amount: number | null) {
  if (amount == null || amount <= 0) return null;
  return amount;
}

export const products = catalog.products
  .map((product) => {
    const price = publishedPrice(product.price);
    const regularPrice = publishedPrice(product.regularPrice);
    return {
      ...product,
      name: cleanCatalogText(product.name),
      excerpt: cleanCatalogText(product.excerpt),
      price,
      regularPrice,
      onSale: Boolean(product.onSale && price != null && regularPrice != null && price < regularPrice),
      categories: product.categories.map((category) => ({
        ...category,
        name: cleanCatalogText(category.name),
      })),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "mk") || String(a.id).localeCompare(String(b.id)));

const childrenByParent = new Map<string, Category[]>();
for (const category of categories) {
  const key = `${category.source}:${category.parent}`;
  const list = childrenByParent.get(key) ?? [];
  list.push(category);
  childrenByParent.set(key, list);
}

const categoryByKey = new Map<string, Category>();
for (const category of categories) {
  categoryByKey.set(`${category.source}:${category.id}`, category);
}

const productsByCategory = new Map<string, Product[]>();
for (const product of products) {
  const seen = new Set<number>();
  for (const category of product.categories) {
    const visited = new Set<number>();
    let currentId = category.id;
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      if (!seen.has(currentId)) {
        seen.add(currentId);
        const key = `${product.source}:${currentId}`;
        const list = productsByCategory.get(key) ?? [];
        list.push(product);
        productsByCategory.set(key, list);
      }
      currentId = categoryByKey.get(`${product.source}:${currentId}`)?.parent ?? 0;
    }
  }
}

export function isSource(value: string): value is Source {
  return value === "treco" || value === "tremark" || value === "its" || value === "alevado";
}

export function isCatalogSource(value: string): value is CatalogSource {
  return value === "treco" || value === "tremark" || value === "alevado";
}

function childrenOf(source: Source, parentId: number) {
  return childrenByParent.get(`${source}:${parentId}`) ?? [];
}

export function productsInCategory(source: Source, id: number) {
  return productsByCategory.get(`${source}:${id}`) ?? [];
}

/** Category id and all descendants (for matching menu rollup counts to product lists). */
export function categorySubtreeIds(source: Source, categoryId: number) {
  const ids = new Set<number>([categoryId]);
  const queue = [categoryId];
  while (queue.length > 0) {
    const parentId = queue.pop()!;
    for (const child of childrenOf(source, parentId)) {
      if (!ids.has(child.id)) {
        ids.add(child.id);
        queue.push(child.id);
      }
    }
  }
  return ids;
}

/** Match static `productsInCategory` indexing (any assigned category in this subtree). */
export function productInCategorySubtree(product: Product, source: Source, categoryId: number) {
  if (product.source !== source) return false;
  const subtree = categorySubtreeIds(source, categoryId);
  return product.categories.some((category) => subtree.has(category.id));
}

function categoryHasProducts(category: Category) {
  return productsInCategory(category.source, category.id).length > 0;
}

export function getCategory(source: string, id: number) {
  if (!isSource(source)) return undefined;
  return categories.find((category) => category.source === source && category.id === id);
}

export function getProduct(source: string, id: number | string) {
  if (!isSource(source)) return undefined;
  return products.find((product) => product.source === source && String(product.id) === String(id));
}

export function getProductById(id: number | string) {
  return products.find((product) => String(product.id) === String(id));
}

/** Legacy Alevado URLs used one catalog row per cable type (`{productId}--{type-slug}`). */
export function resolveLegacyProductId(id: string) {
  const direct = getProductById(id);
  if (direct) return { product: direct, typeId: null as string | null };

  const marker = id.indexOf("--");
  if (marker <= 0) return null;

  const parentId = id.slice(0, marker);
  const typeId = id.slice(marker + 2);
  const product = getProductById(parentId);
  if (!product) return null;

  const type = product.types?.find((entry) => entry.id === typeId);
  return { product, typeId: type?.id ?? typeId };
}

export function categoryTrail(category: Category) {
  const trail = [category];
  const seen = new Set<number>([category.id]);
  let current = category;
  while (current.parent) {
    const parent = categories.find(
      (item) => item.source === current.source && item.id === current.parent,
    );
    if (!parent || seen.has(parent.id)) break;
    seen.add(parent.id);
    trail.unshift(parent);
    current = parent;
  }
  return trail;
}

export function searchProducts(query: string, source?: Source) {
  const pool = source ? products.filter((product) => product.source === source) : products;
  return searchAndRankProducts(pool, query, "mk");
}

export function featuredProducts(source: Source, limit: number) {
  const pool = products.filter(
    (product) => product.source === source && product.image && product.price != null,
  );
  const picked: Product[] = [];
  const seenCategories = new Set<number>();

  for (const product of pool) {
    const categoryId = product.categories[0]?.id ?? product.id;
    if (seenCategories.has(categoryId)) continue;
    seenCategories.add(categoryId);
    picked.push(product);
    if (picked.length >= limit) return picked;
  }

  for (const product of pool) {
    if (picked.some((item) => item.id === product.id)) continue;
    picked.push(product);
    if (picked.length >= limit) break;
  }

  return picked;
}

const catalogCounts = buildCatalogTotals(
  products,
  categories.filter(categoryHasProducts).length,
);

export function counts(): CatalogTotals {
  return catalogCounts;
}

const trecoGroups: { key: string; title: string; slugs: string[] }[] = [
  {
    key: "surveillance",
    title: "Видеонадзор",
    slugs: [
      "tiandy",
      "camera-ip-bullet",
      "camera-ip-dome",
      "camera-ip-nvr-s",
      "camera-ptz",
      "kamera-sigurie",
      "zoneai",
    ],
  },
  {
    key: "networks",
    title: "Мрежи",
    slugs: [
      "mikrotik",
      "ubiquiti",
      "cudy",
      "fiber-optics",
      "network-accessories",
      "router-switch",
      "wireless",
      "pasjisje-rrjeti",
      "switch-poe",
      "unmanaged-switch",
      "unmistakable-switch",
      "network-storage-nas",
      "chargers-cudy",
    ],
  },
  {
    key: "access",
    title: "Пристап и аларм",
    slugs: [
      "access-control",
      "ajax-kit",
      "alarm",
      "dmtech-fire-alarm",
      "electric-lock",
      "exit-button",
      "rfid-card",
      "rfid-reader",
      "door-entry-system",
      "fanvil",
      "barcode-scanner",
      "time-attendance",
      "intercoms",
    ],
  },
  {
    key: "energy",
    title: "Дом, енергија и додатоци",
    slugs: [
      "smart-home",
      "home-solution",
      "inverter-ups",
      "invertor-sisteme-solare",
      "invertor-solar",
      "hdmi-cables-accessories",
      "accessories",
      "usb-hubs",
      "office-solution",
      "sound-system",
      "microphone-wireless-system",
      "gaming-monitor",
      "display-video-adapters",
      "aksesore-per-kompjuter-dhe-laptop",
      "satelite-reciver",
      "iptv",
      "uncategorized",
    ],
  },
];

function toLink(category: Category, depth: number): MenuLink {
  const children =
    depth <= 0
      ? []
      : childrenOf(category.source, category.id)
          .filter(categoryHasProducts)
          .map((child) => toLink(child, depth - 1));

  return {
    name: category.name,
    href: categoryHref(category),
    count: productsInCategory(category.source, category.id).length,
    source: category.source,
    slug: category.slug,
    children,
  };
}

function toColumn(category: Category): MenuColumn {
  const link = toLink(category, 3);
  return {
    title: link.name,
    href: link.href,
    count: link.count,
    source: category.source,
    slug: category.slug,
    children: link.children,
  };
}

const menuCache = new Map<Source, MenuGroup[]>();
let technologyMenuCached: MenuGroup[] | undefined;

export function technologyMenuGroups(): MenuGroup[] {
  if (technologyMenuCached) return technologyMenuCached;

  const groups = menuGroups("treco");
  const alevadoRoots = categories.filter(
    (category) => category.source === "alevado" && category.parent === 0 && categoryHasProducts(category),
  );
  if (alevadoRoots.length === 0) {
    technologyMenuCached = groups;
    return groups;
  }

  technologyMenuCached = [
    ...groups,
    {
      key: "cables",
      title: "Кабли",
      columns: alevadoRoots.map(toColumn),
    },
  ];
  return technologyMenuCached;
}

export function menuGroups(source: Source): MenuGroup[] {
  const cached = menuCache.get(source);
  if (cached) return cached;

  const roots = categories.filter(
    (category) => category.source === source && category.parent === 0 && categoryHasProducts(category),
  );

  if (source === "tremark") {
    const homeGroups = [{ key: "home", title: "Дом", columns: roots.map(toColumn) }];
    menuCache.set(source, homeGroups);
    return homeGroups;
  }

  const used = new Set<string>();
  const groups = trecoGroups
    .map((group) => {
      const columns = group.slugs.flatMap((slug) => {
        const match = roots.find((category) => category.slug === slug);
        if (!match) return [];
        used.add(slug);
        return [toColumn(match)];
      });
      return { key: group.key, title: group.title, columns };
    })
    .filter((group) => group.columns.length > 0);

  const rest = roots.filter((category) => !used.has(category.slug)).map(toColumn);
  if (rest.length > 0) groups.push({ key: "rest", title: "Останато", columns: rest });
  menuCache.set(source, groups);
  return groups;
}

export function divisionCategories(source: Source) {
  const groups = source === "treco" ? technologyMenuGroups() : menuGroups(source);
  return groups.flatMap((group) =>
    group.columns.map((column) => ({ group: group.title, groupKey: group.key, ...column })),
  );
}

