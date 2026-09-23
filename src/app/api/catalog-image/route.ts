import { isCatalogImageUrl } from "@/lib/catalog-image";

const MAX_BYTES = 5 * 1024 * 1024;

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url")?.trim();
  if (!raw || !isCatalogImageUrl(raw)) {
    return new Response("Forbidden", { status: 403 });
  }

  const upstream = await fetch(raw, {
    headers: {
      "User-Agent": "ITS-Group-Catalog/1.0",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
    redirect: "follow",
  });

  if (!upstream.ok) {
    return new Response("Upstream error", { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return new Response("Not an image", { status: 415 });
  }

  const body = await upstream.arrayBuffer();
  if (body.byteLength > MAX_BYTES) {
    return new Response("Too large", { status: 413 });
  }

  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
