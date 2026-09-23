const catalogHosts = new Set(["treco.mk", "www.treco.mk", "tremark.mk", "www.tremark.mk"]);

function parseImageUrl(url: string) {
  try {
    return new URL(url);
  } catch {
    if (url.startsWith("//")) {
      return new URL(`https:${url}`);
    }
    return null;
  }
}

export function normalizeMediaPath(url: string) {
  const match = url.match(/\/api\/media\/[0-9a-f-]{36}/i);
  return match?.[0] ?? null;
}

export function isProxiedImageUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return false;
  if (trimmed.startsWith("/api/media/") || normalizeMediaPath(trimmed)) return false;

  const parsed = parseImageUrl(trimmed);
  if (!parsed) return false;
  return parsed.protocol === "https:" || parsed.protocol === "http:";
}

export function isCatalogImageUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/api/media/") || normalizeMediaPath(trimmed)) return true;

  const parsed = parseImageUrl(trimmed);
  if (!parsed) return false;
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;

  const hostname = parsed.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".local")) return false;
  if (hostname === "127.0.0.1" || hostname === "::1" || hostname.startsWith("10.")) return false;

  if (catalogHosts.has(hostname)) {
    return parsed.pathname.startsWith("/wp-content/uploads/");
  }

  return parsed.protocol === "https:";
}

export function catalogImageSrc(url: string | null | undefined) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const mediaPath = trimmed.startsWith("/api/media/") ? trimmed : normalizeMediaPath(trimmed);
  if (mediaPath) return mediaPath;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;

  if (isProxiedImageUrl(trimmed)) {
    return `/api/catalog-image?url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}
