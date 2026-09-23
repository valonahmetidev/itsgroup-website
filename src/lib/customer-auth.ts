import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getAuthSecret } from "@/lib/password";

export const CUSTOMER_SESSION_COOKIE = "its-customer-session";
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

type SessionPayload = {
  role: "customer";
  customerId: string;
  exp: number;
};

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(value: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionPayload;
    if (parsed.role !== "customer" || typeof parsed.exp !== "number" || typeof parsed.customerId !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function createCustomerSessionToken(customerId: string, secret: string) {
  const payload: SessionPayload = { role: "customer", customerId, exp: Date.now() + SESSION_MS };
  const encoded = encodePayload(payload);
  return `${encoded}.${sign(encoded, secret)}`;
}

export function verifyCustomerSessionToken(token: string, secret: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded, secret);
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  const payload = decodePayload(encoded);
  if (!payload || payload.exp <= Date.now()) return null;
  return payload.customerId;
}

export async function getCustomerSessionId() {
  const secret = getAuthSecret();
  if (!secret) return null;
  const token = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerSessionToken(token, secret);
}

export async function setCustomerSession(customerId: string) {
  const secret = getAuthSecret();
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  const token = createCustomerSessionToken(customerId, secret);
  (await cookies()).set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}

export async function clearCustomerSession() {
  (await cookies()).delete(CUSTOMER_SESSION_COOKIE);
}
