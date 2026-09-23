import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@/lib/db";

export function getDb(): D1Database | null {
  try {
    const { env } = getCloudflareContext({ async: false });
    return (env as { DB?: D1Database }).DB ?? null;
  } catch {
    return null;
  }
}

/** Prefer this in server actions and other async request handlers. */
export async function getDbAsync(): Promise<D1Database | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as { DB?: D1Database }).DB ?? null;
  } catch {
    return getDb();
  }
}
