/**
 * After catalog refresh, reconcile D1 rows that point at products no longer in catalog.json.
 *
 * Policy:
 * - product_overrides: set hidden = 1 (keep admin edits if the product returns)
 * - customer_product_discounts: delete (discount on a missing product is useless)
 *
 * Usage:
 *   node scripts/prune-catalog-orphans.mjs          # dry-run (default)
 *   node scripts/prune-catalog-orphans.mjs --apply  # write to remote D1 (needs CLOUDFLARE_API_TOKEN)
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const apply = process.argv.includes("--apply");
const remote = process.argv.includes("--local") ? false : true;
const dbName = "itsgroup-db";

const catalog = JSON.parse(readFileSync(path.join(ROOT, "data/catalog.json"), "utf8"));
const liveKeys = new Set(
  catalog.products.filter((product) => product.source === "treco" || product.source === "tremark").map((product) => `${product.source}:${product.id}`),
);

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function d1Query(sql) {
  const target = remote ? "--remote" : "--local";
  const command = `npx wrangler d1 execute ${dbName} ${target} --json --command ${JSON.stringify(sql)}`;
  const output = execSync(command, { cwd: ROOT, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  const parsed = JSON.parse(output);
  const entry = Array.isArray(parsed) ? parsed[0] : parsed;
  return entry?.results ?? [];
}

function d1Run(sql) {
  const target = remote ? "--remote" : "--local";
  const command = `npx wrangler d1 execute ${dbName} ${target} --command ${JSON.stringify(sql)}`;
  execSync(command, { cwd: ROOT, stdio: "inherit" });
}

function loadOrphans() {
  const overrides = d1Query(
    "SELECT source, product_id FROM product_overrides WHERE source IN ('treco', 'tremark')",
  );
  const discounts = d1Query(
    "SELECT customer_id, source, product_id FROM customer_product_discounts WHERE source IN ('treco', 'tremark')",
  );

  const orphanOverrides = overrides.filter((row) => !liveKeys.has(`${row.source}:${row.product_id}`));
  const orphanDiscounts = discounts.filter((row) => !liveKeys.has(`${row.source}:${row.product_id}`));

  return { orphanOverrides, orphanDiscounts };
}

if (!process.env.CLOUDFLARE_API_TOKEN && apply && remote) {
  console.error("Set CLOUDFLARE_API_TOKEN to apply orphan cleanup on remote D1.");
  process.exit(1);
}

let orphanOverrides = [];
let orphanDiscounts = [];

try {
  const result = loadOrphans();
  orphanOverrides = result.orphanOverrides;
  orphanDiscounts = result.orphanDiscounts;
} catch (error) {
  if (!apply) {
    console.log("Skipping D1 orphan check (database not available locally).");
    process.exit(0);
  }
  throw error;
}

console.log(`Catalog products: ${liveKeys.size}`);
console.log(`Orphan overrides: ${orphanOverrides.length}`);
console.log(`Orphan customer discounts: ${orphanDiscounts.length}`);

if (orphanOverrides.length === 0 && orphanDiscounts.length === 0) {
  console.log("Nothing to reconcile.");
  process.exit(0);
}

if (!apply) {
  for (const row of orphanOverrides.slice(0, 10)) {
    console.log(`  override ${row.source}:${row.product_id} -> would hide`);
  }
  for (const row of orphanDiscounts.slice(0, 10)) {
    console.log(`  discount ${row.customer_id} ${row.source}:${row.product_id} -> would delete`);
  }
  if (orphanOverrides.length > 10 || orphanDiscounts.length > 10) {
    console.log("  ...");
  }
  console.log("Dry run only. Pass --apply to update D1.");
  process.exit(0);
}

for (const row of orphanOverrides) {
  d1Run(
    `UPDATE product_overrides SET hidden = 1, updated_at = datetime('now') WHERE source = ${sqlString(row.source)} AND product_id = ${Number(row.product_id)}`,
  );
}

for (const row of orphanDiscounts) {
  d1Run(
    `DELETE FROM customer_product_discounts WHERE customer_id = ${sqlString(row.customer_id)} AND source = ${sqlString(row.source)} AND product_id = ${sqlString(row.product_id)}`,
  );
}

console.log(`Hidden ${orphanOverrides.length} overrides and removed ${orphanDiscounts.length} customer discounts.`);
