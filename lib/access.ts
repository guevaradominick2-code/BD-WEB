import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export const ACCESS_COOKIE = "maria_access";
const SESSION_SECONDS = 60 * 60 * 24 * 30;

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function signature(expiresAt: string) {
  const secret = process.env.ACCESS_SESSION_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(expiresAt).digest("base64url");
}

export function verifyAccessWord(candidate: string) {
  const expected = process.env.ACCESS_WORD;
  return Boolean(expected && safeEqual(candidate, expected));
}

export function createAccessSession() {
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  const signed = signature(expiresAt);
  if (!signed) return null;
  return { value: `${expiresAt}.${signed}`, maxAge: SESSION_SECONDS };
}

export function verifyAccessSession(value?: string) {
  if (!value) return false;
  const [expiresAt, provided, extra] = value.split(".");
  if (!expiresAt || !provided || extra || Number(expiresAt) <= Math.floor(Date.now() / 1000)) {
    return false;
  }
  const expected = signature(expiresAt);
  return Boolean(expected && safeEqual(provided, expected));
}
