const AI_CRAWLER =
  /GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|anthropic-ai|Bytespider|CCBot|Google-Extended|meta-externalagent/i;

const APP_PREFIXES = ["/admin", "/profil", "/najava", "/ponuda"];
const DIVISION_BY_SOURCE = {
  treco: "technology",
  technology: "technology",
  tremark: "home",
  home: "home",
  alevado: "cables",
  cables: "cables",
  its: "its",
};

const FALLBACK_RATES = {
  base: "MKD",
  updatedAt: "fallback",
  rates: { MKD: 1, EUR: 0.01625, USD: 0.01785, CHF: 0.01538 },
};

const ANONYMOUS_SESSION = JSON.stringify({ profile: null, pricing: null });
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const NOT_FOUND_HTML = `<!doctype html>
<html lang="mk">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Страницата не е пронајдена · ITS Group</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0c0e12; color: #f4f1ea; font-family: "Segoe UI", system-ui, sans-serif; }
  main { width: min(36rem, calc(100% - 2.5rem)); }
  p { color: #0f6e56; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
  h1 { margin: 0.75rem 0 0; font-size: clamp(2rem, 6vw, 3.4rem); line-height: 1.05; }
  a { color: #f4f1ea; }
</style>
<main>
  <p>404</p>
  <h1>Страницата не е пронајдена.</h1>
  <p style="margin-top:1.25rem;letter-spacing:0;text-transform:none;font-weight:450;color:rgba(244,241,234,.72)"><a href="/">Кон почетната</a></p>
</main>`;

function json(body, status, cacheControl) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cacheControl,
    },
  });
}

function text(body, status) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) === name) return trimmed.slice(eq + 1);
  }
  return null;
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function signaturesMatch(left, right) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let i = 0; i < left.length; i += 1) mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return mismatch === 0;
}

async function customerIdFromToken(token, secret) {
  const splitAt = token.lastIndexOf(".");
  if (splitAt <= 0) return null;
  const encoded = token.slice(0, splitAt);
  const signature = token.slice(splitAt + 1);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encoded)));
  if (!signaturesMatch(toBase64Url(mac), signature)) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded)));
    if (payload.role !== "customer" || typeof payload.customerId !== "string" || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp <= Date.now()) return null;
    return payload.customerId;
  } catch {
    return null;
  }
}

function decodeStoredImage(data) {
  if (typeof Uint8Array.fromBase64 === "function") return Uint8Array.fromBase64(data);
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function isPublicImageUrl(raw) {
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host === "0.0.0.0" || host === "::1") return false;
  if (host === "127.0.0.1" || host.startsWith("10.") || host.startsWith("192.168.") || host.startsWith("169.254.")) {
    return false;
  }
  return true;
}

function mediaIdFromPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "api" || parts[1] !== "media") return null;
  const leaf = parts.length === 3 ? parts[2] : parts.length === 4 && parts[2] === "products" ? parts[3] : null;
  if (!leaf) return null;
  const id = leaf.split(".")[0];
  return UUID_RE.test(id) ? id : null;
}

function wantsFlight(request, url) {
  if (request.headers.get("rsc") === "1") return true;
  if (url.searchParams.has("_rsc")) return true;
  return (request.headers.get("accept") ?? "").includes("text/x-component");
}

function needsApp(request, url) {
  if (request.method !== "GET" && request.method !== "HEAD") return true;
  if (request.headers.get("next-action")) return true;
  const pathname = url.pathname;
  return APP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function pageCandidates(pathname, flight) {
  const bare = pathname === "/" ? "/index" : pathname.replace(/\/+$/, "") || "/index";
  const candidates = [];
  if (flight) candidates.push(`${bare}.rsc`);
  if (!bare.includes(".")) candidates.push(`${bare}.html`);
  candidates.push(pathname === "/" ? "/index.html" : pathname);
  return candidates;
}

const FILE_TYPES = {
  "/icon": "image/png",
  "/apple-icon": "image/png",
  "/opengraph-image": "image/png",
  "/robots.txt": "text/plain; charset=utf-8",
  "/sitemap.xml": "application/xml; charset=utf-8",
};

function withPageHeaders(response, assetPath) {
  const headers = new Headers(response.headers);
  const vary = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch";
  if (assetPath.endsWith(".rsc")) {
    headers.set("content-type", "text/x-component");
    headers.set("vary", vary);
    headers.set("cache-control", "no-store");
  } else if (assetPath.endsWith(".html")) {
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("vary", vary);
    headers.set("cache-control", "no-store");
  } else if (FILE_TYPES[assetPath]) {
    headers.set("content-type", FILE_TYPES[assetPath]);
    headers.set("cache-control", "public, max-age=86400");
  } else if (!headers.has("cache-control")) {
    headers.set("cache-control", "public, max-age=3600");
  }
  return new Response(response.body, { status: response.status, headers });
}

async function serveAsset(request, env, assetPath) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = assetPath;
  assetUrl.search = "";
  const assetRequest = new Request(assetUrl, { method: "GET" });
  const response = await env.ASSETS.fetch(assetRequest);
  if (response.status === 404) return null;
  const page = withPageHeaders(response, assetPath);
  if (request.method === "HEAD") return new Response(null, { status: page.status, headers: page.headers });
  return page;
}

async function servePublic(request, url, env) {
  let pathname = url.pathname;
  if (pathname === "/favicon.ico") pathname = "/icon";
  if (pathname.includes("..")) return text("Not found", 404);
  const flight = wantsFlight(request, url);
  for (const assetPath of pageCandidates(pathname, flight)) {
    const response = await serveAsset(request, env, assetPath);
    if (response) return response;
  }
  const missing = await serveAsset(request, env, flight ? "/_not-found.rsc" : "/_not-found.html");
  if (missing) return new Response(missing.body, { status: 404, headers: missing.headers });
  if (flight) return text("Not found", 404);
  return new Response(NOT_FOUND_HTML, {
    status: 404,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

async function proxyCatalogImage(url) {
  const raw = url.searchParams.get("url")?.trim();
  if (!raw || !isPublicImageUrl(raw)) return text("Forbidden", 403);
  const parsed = new URL(raw);
  const host = parsed.hostname.toLowerCase();
  let referer;
  if (host.includes("tremark.mk")) referer = "https://tremark.mk/";
  else if (host.includes("treco.mk")) referer = "https://treco.mk/";
  const upstream = await fetch(parsed, {
    headers: {
      "user-agent": "ITS-Group-Catalog/1.0",
      accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      ...(referer ? { referer } : {}),
    },
    redirect: "follow",
  });
  if (!upstream.ok) return text("Upstream error", upstream.status);
  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) return text("Not an image", 415);
  const length = Number(upstream.headers.get("content-length") ?? "0");
  if (length > 5 * 1024 * 1024) return text("Too large", 413);
  return new Response(upstream.body, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

async function serveMedia(pathname, env) {
  const id = mediaIdFromPath(pathname);
  if (!id || !env.DB) return text("Not found", 404);
  const row = await env.DB.prepare("SELECT content_type, data FROM media_assets WHERE id = ?").bind(id).first();
  if (!row?.data || !row.content_type) return text("Not found", 404);
  return new Response(decodeStoredImage(row.data), {
    headers: {
      "content-type": row.content_type,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

async function serveExchangeRates() {
  const cache = caches.default;
  const cacheKey = new Request("https://itsgroup.mk/api/exchange-rates");
  const cached = await cache.match(cacheKey);
  if (cached) return cached;
  try {
    const upstream = await fetch("https://open.er-api.com/v6/latest/MKD");
    if (!upstream.ok) throw new Error("rates request failed");
    const payload = await upstream.json();
    const rates = payload?.rates;
    if (payload?.result !== "success" || !rates?.EUR || !rates?.USD || !rates?.CHF) {
      throw new Error("rates payload invalid");
    }
    const response = json(
      JSON.stringify({
        base: "MKD",
        updatedAt: payload.time_last_update_utc ?? new Date().toISOString(),
        rates: { MKD: 1, EUR: rates.EUR, USD: rates.USD, CHF: rates.CHF },
      }),
      200,
      "public, max-age=3600",
    );
    await cache.put(cacheKey, response.clone());
    return response;
  } catch (error) {
    console.error(error);
    return json(JSON.stringify(FALLBACK_RATES), 200, "public, max-age=300");
  }
}

function expandItsCategoryDiscounts(categoryDiscounts, storeCategories) {
  const itsIds = Object.keys(categoryDiscounts).filter((key) => key.startsWith("its:"));
  if (itsIds.length === 0) return categoryDiscounts;

  const parentById = new Map();
  const childrenByParent = new Map();
  for (const row of storeCategories) {
    parentById.set(row.id, row.parent_id ?? null);
    if (!row.parent_id) continue;
    const list = childrenByParent.get(row.parent_id) ?? [];
    list.push(row.id);
    childrenByParent.set(row.parent_id, list);
  }

  function depthOf(id) {
    let depth = 0;
    const seen = new Set();
    let current = id;
    while (current && !seen.has(current)) {
      seen.add(current);
      current = parentById.get(current) ?? null;
      if (current) depth += 1;
    }
    return depth;
  }

  function descendants(id) {
    const ids = [id];
    const queue = [id];
    const seen = new Set([id]);
    while (queue.length > 0) {
      const current = queue.pop();
      for (const child of childrenByParent.get(current) ?? []) {
        if (seen.has(child)) continue;
        seen.add(child);
        ids.push(child);
        queue.push(child);
      }
    }
    return ids;
  }

  const ranked = itsIds
    .map((key) => ({ key, id: key.slice(4), percent: categoryDiscounts[key], depth: depthOf(key.slice(4)) }))
    .sort((a, b) => b.depth - a.depth);

  const expanded = { ...categoryDiscounts };
  const assigned = new Set();
  for (const discount of ranked) {
    for (const id of descendants(discount.id)) {
      const key = `its:${id}`;
      if (assigned.has(key)) continue;
      expanded[key] = discount.percent;
      assigned.add(key);
    }
  }
  return expanded;
}

async function serveCustomerSession(request, env) {
  const token = readCookie(request.headers.get("cookie"), "its-customer-session");
  if (!token) return json(ANONYMOUS_SESSION, 200, "private, no-store");
  const secret = env.AUTH_SECRET || env.ADMIN_PASSWORD;
  if (!secret || !env.DB) return env.APP.fetch(request);
  const customerId = await customerIdFromToken(token, secret);
  if (!customerId) return json(ANONYMOUS_SESSION, 200, "private, no-store");
  const customer = await env.DB.prepare(
    "SELECT name, discount_percent, active FROM customers WHERE id = ?",
  )
    .bind(customerId)
    .first();
  if (!customer || customer.active !== 1) return json(ANONYMOUS_SESSION, 200, "private, no-store");
  const discounts = await env.DB.prepare(
    "SELECT source, product_id, discount_percent FROM customer_product_discounts WHERE customer_id = ?",
  )
    .bind(customerId)
    .all();
  const productDiscounts = {};
  for (const row of discounts.results ?? []) {
    productDiscounts[`${row.source}:${row.product_id}`] = row.discount_percent;
  }

  let categoryDiscounts = {};
  try {
    const categoryRows = await env.DB.prepare(
      "SELECT source, category_id, discount_percent FROM customer_category_discounts WHERE customer_id = ?",
    )
      .bind(customerId)
      .all();
    for (const row of categoryRows.results ?? []) {
      categoryDiscounts[`${row.source}:${row.category_id}`] = row.discount_percent;
    }
    if (Object.keys(categoryDiscounts).some((key) => key.startsWith("its:"))) {
      const storeRows = await env.DB.prepare("SELECT id, parent_id FROM store_categories").all();
      categoryDiscounts = expandItsCategoryDiscounts(categoryDiscounts, storeRows.results ?? []);
    }
  } catch (error) {
    console.error(error);
  }

  return json(
    JSON.stringify({
      profile: { name: customer.name, discountPercent: customer.discount_percent },
      pricing: { generalDiscountPercent: customer.discount_percent, productDiscounts, categoryDiscounts },
    }),
    200,
    "private, no-store",
  );
}

function redirectLegacyCatalog(url) {
  if (url.pathname !== "/katalog") return null;
  const source = url.searchParams.get("source");
  if (!source || url.searchParams.get("division")) return null;
  const mapped = DIVISION_BY_SOURCE[source];
  if (!mapped && source) {
    const next = new URL(url);
    next.searchParams.delete("source");
    return Response.redirect(next, 308);
  }
  const next = new URL(url);
  next.searchParams.delete("source");
  if (mapped) next.searchParams.set("division", mapped);
  return Response.redirect(next, 308);
}

async function handle(request, env) {
  const url = new URL(request.url);
  if (url.hostname === "www.itsgroup.mk") {
    url.hostname = "itsgroup.mk";
    return Response.redirect(url, 308);
  }

  const legacyProduct = url.pathname.match(/^\/proizvod\/([^/]+)--([^/]+)$/);
  if (legacyProduct && (request.method === "GET" || request.method === "HEAD")) {
    const target = new URL(`/proizvod/${legacyProduct[1]}`, url);
    target.searchParams.set("type", legacyProduct[2]);
    return Response.redirect(target, 308);
  }

  const catalogRedirect = redirectLegacyCatalog(url);
  if (catalogRedirect) return catalogRedirect;

  const search = url.search;
  const filteredCatalog =
    search.length > 1 && (url.pathname === "/katalog" || url.pathname.startsWith("/kategorija/"));
  if (filteredCatalog && AI_CRAWLER.test(request.headers.get("user-agent") ?? "")) {
    return text("Catalog filter URLs are not available for this crawler.", 403);
  }

  if (url.pathname === "/api/catalog-image") return proxyCatalogImage(url);
  if (url.pathname === "/api/exchange-rates") return serveExchangeRates();
  if (url.pathname === "/api/customer-session") return serveCustomerSession(request, env);
  if (url.pathname.startsWith("/api/media/")) return serveMedia(url.pathname, env);

  if (needsApp(request, url)) return env.APP.fetch(request);
  if (request.method !== "GET" && request.method !== "HEAD") return text("Method not allowed", 405);
  return servePublic(request, url, env);
}

export default {
  async fetch(request, env) {
    try {
      return await handle(request, env);
    } catch (error) {
      console.error(error);
      return text("Temporary error", 500);
    }
  },
};
