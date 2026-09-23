import { isCatalogImageUrl } from "@/lib/catalog-image";

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url");
  if (!raw || !isCatalogImageUrl(raw)) {
    return new Response("Forbidden", { status: 403 });
  }

  const upstream = await fetch(raw, {
    headers: { "User-Agent": "ITS-Group-Catalog/1.0" },
  });

  if (!upstream.ok) {
    return new Response("Upstream error", { status: upstream.status });
  }

  const body = await upstream.arrayBuffer();
  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";

  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
