import { getDb } from "@/lib/cloudflare";
import { decodeMediaAsset, getMediaAsset } from "@/lib/media";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const db = getDb();
  if (!db) {
    return new Response("Not found", { status: 404 });
  }

  const { path } = await context.params;
  const id = path.length === 1 ? path[0] : path.length === 2 && path[0] === "products" ? path[1]?.split(".")[0] : null;
  if (!id || !UUID_RE.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const asset = await getMediaAsset(db, id);
  if (!asset) {
    return new Response("Not found", { status: 404 });
  }

  const body = decodeMediaAsset(asset);
  return new Response(body, {
    headers: {
      "Content-Type": asset.content_type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
