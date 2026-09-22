import rawCatalog from "../../data/catalog.json";
import { categoryHref } from "@/lib/paths";
import type { Category, MenuColumn, MenuGroup, MenuLink, Product, Source } from "@/lib/types";

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

export const fetchedAt = catalog.fetchedAt;
export const categories = catalog.categories.map((category) => ({
  ...category,
  name: decodeText(category.name),
}));
function publishedPrice(amount: number | null) {
  if (amount == null || amount <= 0) return null;
  return amount;
}

export const products = catalog.products.map((product) => {
  const price = publishedPrice(product.price);
  const regularPrice = publishedPrice(product.regularPrice);
  return {
    ...product,
    name: decodeText(product.name),
    excerpt: decodeText(product.excerpt),
    price,
    regularPrice,
    onSale: Boolean(product.onSale && price != null && regularPrice != null && price < regularPrice),
    categories: product.categories.map((category) => ({
      ...category,
      name: decodeText(category.name),
    })),
  };
});

const childrenByParent = new Map<string, Category[]>();
for (const category of categories) {
  const key = `${category.source}:${category.parent}`;
  const list = childrenByParent.get(key) ?? [];
  list.push(category);
  childrenByParent.set(key, list);
}

const directProducts = new Map<string, Product[]>();
for (const product of products) {
  for (const category of product.categories) {
    const key = `${product.source}:${category.id}`;
    const list = directProducts.get(key) ?? [];
    list.push(product);
    directProducts.set(key, list);
  }
}

const descendantCache = new Map<string, number[]>();
const expandedCache = new Map<string, Product[]>();

export function isSource(value: string): value is Source {
  return value === "treco" || value === "tremark";
}

function childrenOf(source: Source, parentId: number) {
  return childrenByParent.get(`${source}:${parentId}`) ?? [];
}

function collectDescendants(source: Source, id: number, seen: Set<number>): number[] {
  if (seen.has(id)) return [];
  seen.add(id);
  const ids = [id];
  for (const child of childrenOf(source, id)) {
    ids.push(...collectDescendants(source, child.id, seen));
  }
  return ids;
}

function descendantIds(source: Source, id: number) {
  const key = `${source}:${id}`;
  const cached = descendantCache.get(key);
  if (cached) return cached;
  const ids = collectDescendants(source, id, new Set());
  descendantCache.set(key, ids);
  return ids;
}

export function productsInCategory(source: Source, id: number) {
  const key = `${source}:${id}`;
  const cached = expandedCache.get(key);
  if (cached) return cached;
  const merged = new Map<number, Product>();
  for (const descendantId of descendantIds(source, id)) {
    for (const product of directProducts.get(`${source}:${descendantId}`) ?? []) {
      merged.set(product.id, product);
    }
  }
  const list = [...merged.values()].sort((a, b) => a.name.localeCompare(b.name, "mk"));
  expandedCache.set(key, list);
  return list;
}

function categoryHasProducts(category: Category) {
  return productsInCategory(category.source, category.id).length > 0;
}

export function getCategory(source: string, id: number) {
  if (!isSource(source)) return undefined;
  return categories.find((category) => category.source === source && category.id === id);
}

export function getProduct(source: string, id: number) {
  if (!isSource(source)) return undefined;
  return products.find((product) => product.source === source && product.id === id);
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
  const terms = query.toLocaleLowerCase("mk").split(/\s+/).filter(Boolean);
  return products.filter((product) => {
    if (source && product.source !== source) return false;
    if (!terms.length) return true;
    const haystack = `${product.name} ${product.excerpt} ${product.categories
      .map((category) => category.name)
      .join(" ")}`.toLocaleLowerCase("mk");
    return terms.every((term) => haystack.includes(term));
  });
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

export function counts() {
  return {
    treco: products.filter((product) => product.source === "treco").length,
    tremark: products.filter((product) => product.source === "tremark").length,
    categories: categories.filter(categoryHasProducts).length,
  };
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
          .sort((a, b) => a.name.localeCompare(b.name, "mk"))
          .map((child) => toLink(child, depth - 1));

  return {
    name: category.name,
    href: categoryHref(category),
    count: productsInCategory(category.source, category.id).length,
    children,
  };
}

function toColumn(category: Category): MenuColumn {
  const link = toLink(category, 3);
  return {
    title: link.name,
    href: link.href,
    count: link.count,
    children: link.children,
  };
}

const menuCache = new Map<Source, MenuGroup[]>();

export function menuGroups(source: Source): MenuGroup[] {
  const cached = menuCache.get(source);
  if (cached) return cached;

  const roots = categories
    .filter((category) => category.source === source && category.parent === 0 && categoryHasProducts(category))
    .sort((a, b) => a.name.localeCompare(b.name, "mk"));

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
  return menuGroups(source).flatMap((group) =>
    group.columns.map((column) => ({ group: group.title, groupKey: group.key, ...column })),
  );
}
