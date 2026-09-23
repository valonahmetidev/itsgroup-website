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

function extractExcerpt(html) {
  const match = html.match(/<meta name="description" content="([^"]+)"/i);
  return match ? decodeHtml(match[1]) : "";
}

function extractImage(html) {
  const match = html.match(/href="(\/api\/pb\/files\/[^"]+)"/i);
  return match ? `${BASE}${match[1]}` : null;
}

const productsIndexHtml = await fetchText(`${BASE}/${LOCALE}/products`);
const categorySlugs = extractCategorySlugs(productsIndexHtml);
console.log(`categories: ${categorySlugs.length}`);

const categories = categorySlugs.map((slug, index) => ({
  id: index + 1,
  source: "alevado",
  name: slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" "),
  slug,
  parent: 0,
  count: 0,
}));

const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
const productPaths = [];

for (const categorySlug of categorySlugs) {
  const html = await fetchText(`${BASE}/${LOCALE}/products/${categorySlug}`);
  const paths = extractProductPaths(html);
  productPaths.push(...paths);
  const category = categoryBySlug.get(categorySlug);
  if (category) category.count = paths.length;
  console.log(`${categorySlug}: ${paths.length}`);
}

const uniquePaths = [...new Map(productPaths.map((entry) => [`${entry.categorySlug}:${entry.productId}`, entry])).values()];
console.log(`products to fetch: ${uniquePaths.length}`);

const products = [];
for (const [index, entry] of uniquePaths.entries()) {
  const html = await fetchText(`${BASE}/${LOCALE}/products/${entry.categorySlug}/${entry.productId}`);
  const category = categoryBySlug.get(entry.categorySlug);
  const name = extractTitle(html);
  const excerpt = extractExcerpt(html).slice(0, 420);
  const image = extractImage(html);
  products.push({
    id: entry.productId,
    source: "alevado",
    name,
    slug: entry.productId,
    price: null,
    regularPrice: null,
    onSale: false,
    currency: "MKD",
    image,
    inStock: true,
    categories: category
      ? [{ id: category.id, name: category.name, slug: category.slug }]
      : [],
    excerpt,
    permalink: `${BASE}/${LOCALE}/products/${entry.categorySlug}/${entry.productId}`,
  });
  if ((index + 1) % 25 === 0) console.log(`fetched ${index + 1}/${uniquePaths.length}`);
}

const payload = {
  fetchedAt: new Date().toISOString(),
  categories,
  products,
};

writeFileSync(path.join(ROOT, "data", "alevado-catalog.json"), JSON.stringify(payload, null, 2));
console.log(`wrote ${products.length} products to data/alevado-catalog.json`);
