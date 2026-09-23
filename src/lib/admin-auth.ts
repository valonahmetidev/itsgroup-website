import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "its-admin-session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

type SessionPayload = {
  role: "admin";
  exp: number;
};

export function getAdminSecret() {
  const fromProcess = process.env.ADMIN_PASSWORD ?? "";
  if (fromProcess) return fromProcess;

  try {
    const { env } = getCloudflareContext({ async: false });
    const fromCloudflare = (env as { ADMIN_PASSWORD?: string }).ADMIN_PASSWORD;
    return typeof fromCloudflare === "string" ? fromCloudflare : "";
  } catch {
    return "";
  }
}

export async function getAdminSecretAsync() {
  const fromProcess = process.env.ADMIN_PASSWORD ?? "";
  if (fromProcess) return fromProcess;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const fromCloudflare = (env as { ADMIN_PASSWORD?: string }).ADMIN_PASSWORD;
    return typeof fromCloudflare === "string" ? fromCloudflare : "";
  } catch {
    return getAdminSecret();
  }
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(value: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionPayload;
    if (parsed.role !== "admin" || typeof parsed.exp !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function createAdminSessionToken(secret: string) {
  const payload: SessionPayload = { role: "admin", exp: Date.now() + SESSION_MS };
  const encoded = encodePayload(payload);
  return `${encoded}.${sign(encoded, secret)}`;
}

export function verifyAdminSessionToken(token: string, secret: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;
  const expected = sign(encoded, secret);
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  const payload = decodePayload(encoded);
  if (!payload) return false;
  return payload.exp > Date.now();
}

export function verifyAdminPassword(password: string, secret: string) {
  if (!secret) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isAdminAuthenticated() {
  const secret = getAdminSecret();
  if (!secret) return false;
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminSessionToken(token, secret);
}

export async function setAdminSession() {
  const secret = getAdminSecret();
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured");
  const token = createAdminSessionToken(secret);
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
}
