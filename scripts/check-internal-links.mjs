import fs from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
const srcDir = path.join(root, "src");

const hrefRe = /href=["'{](\/[^"'}\s#?]*)/g;
const linkRe = /Link[^>]+href=["'{](\/[^"'}\s#?]*)/g;

const staticRoutes = new Set([
  "/",
  "/tehnologija",
  "/dom",
  "/katalog",
  "/za-nas",
  "/kontakt",
  "/ponuda",
  "/najava",
  "/privacy",
  "/terms",
  "/admin",
  "/admin/login",
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx|ts|jsx|js|mdx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const hrefs = new Set();
for (const file of walk(srcDir)) {
  const text = fs.readFileSync(file, "utf8");
  for (const re of [hrefRe, linkRe]) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(text))) {
      const href = match[1].split("?")[0];
      if (href.startsWith("/api")) continue;
      hrefs.add(href);
    }
  }
}

const dynamicPrefixes = ["/proizvod/", "/kategorija/", "/admin/"];
const issues = [];

for (const href of hrefs) {
  if (staticRoutes.has(href)) continue;
  if (dynamicPrefixes.some((prefix) => href.startsWith(prefix))) continue;
  if (href.includes("${") || href.includes("`")) continue;
  issues.push(href);
}

if (issues.length === 0) {
  console.log("No suspicious internal links found.");
} else {
  console.log("Review these internal paths (no matching static route):");
  for (const href of [...issues].sort()) console.log(`  ${href}`);
  process.exitCode = 1;
}
