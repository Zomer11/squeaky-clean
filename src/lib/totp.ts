import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;
const MIN_SECRET_BYTES = 16;

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[\s=-]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error("Invalid base32 character");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
      value &= (1 << bits) - 1;
    }
  }
  return Buffer.from(out);
}

export function isValidTotpSecret(secret: string): boolean {
  try {
    return base32Decode(secret).length >= MIN_SECRET_BYTES;
  } catch {
    return false;
  }
}

function hotp(key: Buffer, counter: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const mac = createHmac("sha1", key).update(msg).digest();
  const offset = mac[mac.length - 1] & 0x0f;
  const code = (mac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return code.toString().padStart(6, "0");
}

/**
 * RFC 6238 TOTP check with ±1 step of clock drift.
 * Returns the matched time-step counter (for replay protection) or null.
 */
export function matchTotp(secret: string, code: string, now = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const key = base32Decode(secret);
  const current = Math.floor(now / 1000 / STEP_SECONDS);
  const given = Buffer.from(code);
  let matched: number | null = null;
  // Check every window without an early exit so timing doesn't leak which one hit.
  for (const counter of [current - 1, current, current + 1]) {
    if (timingSafeEqual(Buffer.from(hotp(key, counter)), given)) matched = counter;
  }
  return matched;
}
