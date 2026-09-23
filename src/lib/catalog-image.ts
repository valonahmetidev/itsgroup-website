const allowedHosts = new Set(["treco.mk", "tremark.mk"]);

export function isCatalogImageUrl(url: string) {
  if (url.startsWith("/api/media/")) return true;
  try {
    const parsed = new URL(url);
    return allowedHosts.has(parsed.hostname) && parsed.pathname.startsWith("/wp-content/uploads/");
  } catch {
    return false;
  }
}

export function catalogImageSrc(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith("/api/media/")) return url;
  if (!isCatalogImageUrl(url)) return url;
  return `/api/catalog-image?url=${encodeURIComponent(url)}`;
}
