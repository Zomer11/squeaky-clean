import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { isPasswordStrongEnough } from "@/lib/security";

const COOKIE = "binbus_admin";
/** Ops desk session — short-lived; re-login is cheap for one operator. */
const MAX_AGE = 60 * 60 * 8; // 8 hours
const MIN_SECRET_LENGTH = 32;

function configuredPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password || null;
}

function secret(): string {
  const value = process.env.ADMIN_SECRET?.trim();
  if (!value || value.length < MIN_SECRET_LENGTH) {
    throw new Error(
      "ADMIN_SECRET must be set to a unique value at least 32 characters. Do not reuse ADMIN_PASSWORD.",
    );
  }
  if (value === configuredPassword()) {
    throw new Error("ADMIN_SECRET must differ from ADMIN_PASSWORD.");
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function equalHex(left: string, right: string): boolean {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function adminConfigured(): boolean {
  const password = configuredPassword();
  if (!password || !isPasswordStrongEnough(password)) return false;
  try {
    secret();
    return true;
  } catch {
    return false;
  }
}

export function verifyPassword(input: string): boolean {
  const expected = configuredPassword();
  if (!expected || !isPasswordStrongEnough(expected)) return false;
  let key: string;
  try {
    key = secret();
  } catch {
    return false;
  }
  const digestA = createHmac("sha256", key).update(input).digest();
  const digestB = createHmac("sha256", key).update(expected).digest();
  return timingSafeEqual(digestA, digestB);
}

export function createSessionToken(): string {
  const exp = Date.now() + MAX_AGE * 1000;
  const nonce = randomBytes(16).toString("hex");
  const payload = `admin:${exp}:${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!payload || !sig) return false;
  try {
    if (!equalHex(sig, sign(payload))) return false;
  } catch {
    return false;
  }
  const parts = payload.split(":");
  const exp = Number(parts[1]);
  if (parts[0] !== "admin" || !Number.isFinite(exp) || Date.now() > exp) {
    return false;
  }
  return true;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return isValidSessionToken(jar.get(COOKIE)?.value);
}

export async function setAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export { COOKIE as ADMIN_COOKIE };
