import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");

const namedEntities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(value) {
  let text = String(value ?? "").replace(/<[^>]+>/g, " ");
  for (let pass = 0; pass < 3; pass += 1) {
    const next = text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
      if (entity.startsWith("#")) {
        const codePoint = entity[1] === "x" || entity[1] === "X"
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

function money(prices) {
  if (!prices || prices.price === "" || prices.price == null) return null;
  const minor = Number(prices.currency_minor_unit ?? 0);
  const raw = Number(prices.price);
  if (!Number.isFinite(raw)) return null;
  return minor > 0 ? raw / 10 ** minor : raw;
}

async function fetchAll(url) {
  const items = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const joiner = url.includes("?") ? "&" : "?";
    const nextUrl = `${url}${joiner}per_page=100&page=${page}`;
    let response;
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      response = await fetch(nextUrl, {
        headers: { "user-agent": "itsgroup-catalog/1.0" },
      });
      if (response.ok) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 800));
    }
    if (!response?.ok) {
      throw new Error(`${nextUrl} failed with ${response?.status}`);
    }
    totalPages = Number(response.headers.get("x-wp-totalpages") || 1);
    const data = await response.json();
    items.push(...data);
    console.log(`${page}/${totalPages} ${items.length} <- ${url}`);
    page += 1;
  }

  return items;
}

function mapCategory(source, category) {
  return {
    id: category.id,
    source,
    name: decode(category.name),
    slug: category.slug,
    parent: category.parent ?? 0,
    count: category.count ?? 0,
  };
}

function mapProduct(source, product) {
  const image = product.images?.[0];
  const price = money(product.prices);
  const regular = product.prices?.regular_price
    ? money({ ...product.prices, price: product.prices.regular_price })
    : price;

  return {
    id: product.id,
    source,
    name: decode(product.name),
    slug: product.slug,
    price,
    regularPrice: regular,
    onSale: Boolean(product.on_sale && regular && price && price < regular),
    currency: product.prices?.currency_code || "MKD",
    image: image?.src || image?.thumbnail || null,
    inStock: Boolean(product.is_in_stock),
    categories: (product.categories || []).map((category) => ({
      id: category.id,
      name: decode(category.name),
      slug: category.slug,
    })),
    excerpt: decode(product.short_description || product.description || "").slice(0, 420),
    permalink: product.permalink,
  };
}

const [trecoCategories, tremarkCategories, trecoProducts, tremarkProducts] = await Promise.all([
  fetchAll("https://treco.mk/wp-json/wp/v2/product_cat?_fields=id,name,slug,parent,count"),
  fetchAll("https://tremark.mk/wp-json/wp/v2/product_cat?_fields=id,name,slug,parent,count"),
  fetchAll("https://treco.mk/wp-json/wc/store/v1/products"),
  fetchAll("https://tremark.mk/wp-json/wc/store/v1/products"),
]);

await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, ["scripts/fetch-alevado-catalog.mjs"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`fetch-alevado-catalog exited ${code}`))));
});

const alevadoCatalog = JSON.parse(await readFile(path.join(ROOT, "data", "alevado-catalog.json"), "utf8"));

const catalog = {
  fetchedAt: new Date().toISOString(),
  categories: [
    ...trecoCategories.map((category) => mapCategory("treco", category)),
    ...tremarkCategories.map((category) => mapCategory("tremark", category)),
    ...alevadoCatalog.categories,
  ],
  products: [
    ...trecoProducts.map((product) => mapProduct("treco", product)),
    ...tremarkProducts.map((product) => mapProduct("tremark", product)),
    ...alevadoCatalog.products,
  ].filter((product) => product.name),
};

const dataDir = path.join(ROOT, "data");
await mkdir(dataDir, { recursive: true });
await writeFile(path.join(dataDir, "catalog.json"), JSON.stringify(catalog));

const bySource = (source) => catalog.products.filter((product) => product.source === source).length;
console.log(
  `Saved ${catalog.categories.length} categories, treco ${bySource("treco")}, tremark ${bySource("tremark")}, alevado ${bySource("alevado")}`,
);
