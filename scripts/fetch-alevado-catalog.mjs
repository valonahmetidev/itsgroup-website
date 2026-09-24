import { writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASE = "https://alevadoenergy.com";
const LOCALE = "mk";

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": "itsgroup-catalog/1.0" } });
  if (!response.ok) throw new Error(`${url} -> ${response.status}`);
  return response.text();
}

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function extractCategorySlugs(html) {
  return [
    ...new Set(
      [...html.matchAll(new RegExp(`href="/${LOCALE}/products/([a-z0-9-]+)"`, "g"))]
        .map((match) => match[1])
        .filter((slug) => slug !== "products"),
    ),
  ];
}

function extractProductPaths(html) {
  return [
    ...new Set(
      [...html.matchAll(new RegExp(`href="/${LOCALE}/products/([a-z0-9-]+)/([a-z0-9]+)"`, "g"))].map(
        (match) => ({ categorySlug: match[1], productId: match[2] }),
      ),
    ),
  ];
}

function extractTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  if (!match) return "";
  return decodeHtml(match[1].split("–")[0].trim());
}

function sanitizePublicText(text) {
  return text
    .replace(/\s*[–—-]\s*Достапно за нарачка кај Alevado Energy\.?/gi, "")
    .replace(/\s*[–—-]\s*Available from Alevado Energy\.?/gi, "")
    .replace(/\s*Alevado Energy\s*[–—-]?\s*/gi, " ")
    .replace(/\bAlevado Energy\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractExcerpt(html) {
  const match = html.match(/<meta name="description" content="([^"]+)"/i);
  return match ? sanitizePublicText(decodeHtml(match[1])) : "";
}

function extractImage(html) {
  const match = html.match(/href="(\/api\/pb\/files\/[^"]+)"/i);
  return match ? `${BASE}${match[1]}` : null;
}

function extractHeading(html) {
  const match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  return match ? decodeHtml(match[1]) : "";
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Each product page lists cable types in a spec table — those rows become `types`, not separate products. */
function extractProductTypes(html) {
  const types = [];

  for (const table of html.matchAll(/<table[\s\S]*?<\/table>/gi)) {
    const tbody = table[0].match(/<tbody[\s\S]*?<\/tbody>/i)?.[0];
    if (!tbody) continue;

    for (const row of tbody.matchAll(/<tr[\s\S]*?<\/tr>/gi)) {
      const cells = [...row[0].matchAll(/<td[^>]*>([^<]*)<\/td>/gi)].map((match) => decodeHtml(match[1]));
      const name = cells[0]?.trim() ?? "";
      if (name.length < 2) continue;
      if (!/[a-zA-Z\u0400-\u04FF0-9]/.test(name)) continue;

      const type = { id: slugify(name) || String(types.length), name };
      if (cells[1]) type.cableDiameterMm = cells[1];
      if (cells[2]) type.weightKgPerKm = cells[2];
      if (cells[3]) type.packagingM = cells[3];
      types.push(type);
    }

    if (types.length > 0) break;
  }

  return [...new Map(types.map((type) => [type.id, type])).values()];
}

const productsIndexHtml = await fetchText(`${BASE}/${LOCALE}/products`);
const categorySlugs = extractCategorySlugs(productsIndexHtml);
console.log(`categories: ${categorySlugs.length}`);

const categoryPages = new Map();
for (const slug of categorySlugs) {
  categoryPages.set(slug, await fetchText(`${BASE}/${LOCALE}/products/${slug}`));
}

const categories = categorySlugs.map((slug, index) => ({
  id: index + 1,
  source: "alevado",
  name: extractHeading(categoryPages.get(slug)) || slug,
  slug,
  parent: 0,
  count: 0,
}));

const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
const productPaths = [];

for (const categorySlug of categorySlugs) {
  const html = categoryPages.get(categorySlug);
  const paths = extractProductPaths(html);
  productPaths.push(...paths);
  console.log(`${categorySlug}: ${paths.length}`);
}

const uniquePaths = [...new Map(productPaths.map((entry) => [`${entry.categorySlug}:${entry.productId}`, entry])).values()];
console.log(`products to fetch: ${uniquePaths.length}`);

const products = [];
let typeCount = 0;
for (const [index, entry] of uniquePaths.entries()) {
  const html = await fetchText(`${BASE}/${LOCALE}/products/${entry.categorySlug}/${entry.productId}`);
  const category = categoryBySlug.get(entry.categorySlug);
  const name = sanitizePublicText(extractTitle(html) || extractHeading(html));
  const excerpt = extractExcerpt(html).slice(0, 420);
  const image = extractImage(html);
  const permalink = `${BASE}/${LOCALE}/products/${entry.categorySlug}/${entry.productId}`;
  const categoryRef = category ? [{ id: category.id, name: category.name, slug: category.slug }] : [];
  const types = extractProductTypes(html);
  typeCount += types.length;

  products.push({
    source: "alevado",
    id: entry.productId,
    name,
    slug: entry.productId,
    price: null,
    regularPrice: null,
    onSale: false,
    currency: "MKD",
    image,
    inStock: true,
    categories: categoryRef,
    excerpt,
    permalink,
    ...(types.length > 0 ? { types } : {}),
  });

  if ((index + 1) % 25 === 0) console.log(`fetched ${index + 1}/${uniquePaths.length}`);
}

console.log(`types: ${typeCount}`);

for (const category of categories) {
  category.count = products.filter((product) => product.categories.some((item) => item.slug === category.slug)).length;
}

const payload = {
  fetchedAt: new Date().toISOString(),
  categories,
  products,
};

writeFileSync(path.join(ROOT, "data", "alevado-catalog.json"), JSON.stringify(payload, null, 2));
console.log(`wrote ${products.length} products to data/alevado-catalog.json`);
