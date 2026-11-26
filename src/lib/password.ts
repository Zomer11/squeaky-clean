import "server-only";

import { scrypt, timingSafeEqual, type ScryptOptions } from "crypto";

/**
 * Hash format written by `npm run admin:setup`:
 *   scrypt:N:r:p:salt(base64url):hash(base64url)
 * Colons, not `$`, because Next's .env loader expands `$NAME`.
 */
const MIN_N = 16384;
const MAX_INPUT = 256;

function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

type Parsed = { N: number; r: number; p: number; salt: Buffer; hash: Buffer };

function parse(stored: string): Parsed | null {
  const parts = stored.trim().split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;
  const [N, r, p] = parts.slice(1, 4).map(Number);
  if (![N, r, p].every(Number.isInteger) || N < MIN_N || (N & (N - 1)) !== 0 || r < 8 || p < 1) {
    return null;
  }
  const salt = Buffer.from(parts[4], "base64url");
  const hash = Buffer.from(parts[5], "base64url");
  if (salt.length < 16 || hash.length < 32) return null;
  return { N, r, p, salt, hash };
}

export function isValidPasswordHash(stored: string): boolean {
  return parse(stored) !== null;
}

export async function verifyPasswordHash(input: string, stored: string): Promise<boolean> {
  const parsed = parse(stored);
  if (!parsed || input.length > MAX_INPUT) return false;
  const { N, r, p, salt, hash } = parsed;
  const actual = await scryptAsync(input.normalize("NFKC"), salt, hash.length, {
    N,
    r,
    p,
    maxmem: 256 * N * r,
  });
  return timingSafeEqual(actual, hash);
}
