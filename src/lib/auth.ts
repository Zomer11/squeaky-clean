import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "binbus_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "dev-secret";
}

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "binbus2026";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function verifyPassword(input: string): boolean {
  const expected = adminPassword();
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = `admin:${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  try {
    const ok = timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!ok) return false;
  } catch {
    return false;
  }
  const parts = payload.split(":");
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return parts[0] === "admin";
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
