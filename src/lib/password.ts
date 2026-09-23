import { createHmac, timingSafeEqual } from "node:crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getAuthSecret() {
  const fromProcess = process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD ?? "";
  if (fromProcess) return fromProcess;

  try {
    const { env } = getCloudflareContext({ async: false });
    const cloudflare = env as { AUTH_SECRET?: string; ADMIN_PASSWORD?: string };
    return cloudflare.AUTH_SECRET ?? cloudflare.ADMIN_PASSWORD ?? "";
  } catch {
    return "";
  }
}

export async function getAuthSecretAsync() {
  const fromProcess = process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD ?? "";
  if (fromProcess) return fromProcess;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const cloudflare = env as { AUTH_SECRET?: string; ADMIN_PASSWORD?: string };
    return cloudflare.AUTH_SECRET ?? cloudflare.ADMIN_PASSWORD ?? "";
  } catch {
    return getAuthSecret();
  }
}

export function hashPassword(password: string, secret: string) {
  return createHmac("sha256", secret).update(`pw:${password}`).digest("base64url");
}

export function verifyPassword(password: string, hash: string, secret: string) {
  if (!secret || !hash) return false;
  const candidate = hashPassword(password, secret);
  try {
    return timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
  } catch {
    return false;
  }
}
