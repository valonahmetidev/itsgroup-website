import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const cacheRoot = path.resolve(".open-next/cache");
const assetsDir = path.resolve(".open-next/assets");
const outDir = path.resolve(".open-next/public");
const maxBytes = 24 * 1024 * 1024;

function buildDir() {
  const names = readdirSync(cacheRoot).filter((name) => name !== "__fetch");
  const matches = names.filter((name) => existsSync(path.join(cacheRoot, name, "index.cache")));
  if (matches.length === 0) throw new Error("No prerender cache with index.cache was found.");
  matches.sort((left, right) => statSync(path.join(cacheRoot, right)).mtimeMs - statSync(path.join(cacheRoot, left)).mtimeMs);
  return path.join(cacheRoot, matches[0]);
}

function routeFromCache(relativeFile) {
  return relativeFile.replaceAll("\\", "/").replace(/\.cache$/, "");
}

function writeChecked(filePath, contents) {
  const size = Buffer.isBuffer(contents) ? contents.length : Buffer.byteLength(contents);
  if (size > maxBytes) {
    throw new Error(`${filePath} is ${size} bytes, above the Workers static asset limit.`);
  }
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents);
}

function walk(dir, files) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(filePath, files);
    else if (entry.name.endsWith(".cache")) files.push(filePath);
  }
  return files;
}

if (!existsSync(assetsDir)) throw new Error("Missing .open-next/assets. Build the OpenNext worker first.");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(assetsDir, outDir, { recursive: true });

const root = buildDir();
const files = walk(root, []);
let pages = 0;
let routes = 0;

for (const filePath of files) {
  const entry = JSON.parse(readFileSync(filePath, "utf8"));
  const route = routeFromCache(path.relative(root, filePath));
  if (entry.type === "app") {
    if (!entry.html) continue;
    writeChecked(path.join(outDir, `${route}.html`), entry.html);
    if (entry.rsc) writeChecked(path.join(outDir, `${route}.rsc`), entry.rsc);
    pages += 1;
  } else if (entry.type === "route") {
    const contentType = entry.meta?.headers?.["content-type"] ?? "";
    const body = entry.body ?? "";
    const contents = contentType.startsWith("image/") ? Buffer.from(body, "base64") : body;
    writeChecked(path.join(outDir, route), contents);
    routes += 1;
  }
  if ((pages + routes) % 250 === 0) console.log(`extracted ${pages + routes}/${files.length}`);
}

console.log(`Public assets ready: ${pages} pages, ${routes} files, from ${path.basename(root)}`);
