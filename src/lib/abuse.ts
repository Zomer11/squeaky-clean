import "server-only";

import { sqlite } from "@/lib/db";

/**
 * Business-level flood caps. Per-IP limits are useless against attackers who
 * rotate IPs, so these count what actually landed in the database.
 * Tunable via env; defaults sit well above what a one-van operator sees.
 */
function envInt(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function since(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

function count(sql: string, ...params: unknown[]): number {
  return (sqlite.prepare(sql).get(...params) as { n: number }).n;
}

const BUSY =
  "We’re getting an unusual number of requests right now. Please call or text us and we’ll sort it out.";

export function bookingFloodError(mobile: string): string | null {
  const perPhone = count(
    "SELECT COUNT(*) AS n FROM bookings WHERE phone = ? AND created_at > ? AND status = 'confirmed'",
    mobile,
    since(DAY),
  );
  if (perPhone >= envInt("BOOKING_MAX_PER_PHONE_DAY", 3)) {
    return "You’ve already got bookings in today. Call or text us to add another.";
  }
  const global = count("SELECT COUNT(*) AS n FROM bookings WHERE created_at > ?", since(HOUR));
  if (global >= envInt("BOOKING_MAX_PER_HOUR", 20)) return BUSY;
  return null;
}

export function inquiryFloodError(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  const perPhone = count(
    "SELECT COUNT(*) AS n FROM inquiries WHERE replace(replace(replace(phone, ' ', ''), '+', ''), '-', '') LIKE ? AND created_at > ?",
    `%${digits.slice(-9)}`,
    since(DAY),
  );
  if (perPhone >= envInt("INQUIRY_MAX_PER_PHONE_DAY", 4)) {
    return "We’ve got your earlier messages. We’ll be in touch, or call us.";
  }
  const global = count("SELECT COUNT(*) AS n FROM inquiries WHERE created_at > ?", since(HOUR));
  if (global >= envInt("INQUIRY_MAX_PER_HOUR", 30)) return BUSY;
  return null;
}
