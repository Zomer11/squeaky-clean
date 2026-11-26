import "server-only";

const WEAK_PASSWORDS = new Set([
  "binbus2026",
  "change-me",
  "password",
  "admin",
  "admin123",
  "generate-a-long-random-password",
  "generate-a-longer-random-secret",
]);

const MIN_PASSWORD_LENGTH = 16;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 20_000;

function pruneBuckets(now: number) {
  if (buckets.size < 200) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  // A flood from many IPs must not grow memory without bound; drop the oldest keys.
  if (buckets.size > MAX_BUCKETS) {
    const excess = buckets.size - MAX_BUCKETS;
    let i = 0;
    for (const key of buckets.keys()) {
      if (i++ >= excess) break;
      buckets.delete(key);
    }
  }
}

/**
 * Reads a JSON body with a hard byte cap, even when Content-Length is missing
 * or lies (chunked uploads). Returns undefined if too big or not JSON.
 */
export async function readJsonLimited(request: Request, maxBytes = 16 * 1024): Promise<unknown> {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maxBytes) return undefined;
  if (!request.body) return undefined;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      return undefined;
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return undefined;
  }
}

/** Strips CR/LF and other control chars so user text can't break email headers. */
export function oneLine(value: string, max = 120): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max);
}

function cleanIp(value: string | null | undefined): string | null {
  const ip = value?.trim();
  if (!ip || ip.length > 64 || !/^[0-9a-fA-F:.]+$/.test(ip)) return null;
  return ip;
}

/**
 * Client IP for rate limits. The left side of X-Forwarded-For is whatever the
 * client typed, so never trust it. Set TRUSTED_IP_HEADER to the header your
 * host overwrites (cf-connecting-ip, fly-client-ip, x-vercel-forwarded-for,
 * x-real-ip). Otherwise use the right-most X-Forwarded-For hop, which is the
 * one appended by the proxy in front of the app.
 */
export function clientIp(request: Request): string {
  return clientIpFromHeaders(request.headers);
}

export function clientIpFromHeaders(headers: Headers): string {
  const trusted = process.env.TRUSTED_IP_HEADER?.trim().toLowerCase();
  if (trusted) {
    const value = headers.get(trusted)?.split(",")[0];
    const ip = cleanIp(value);
    if (ip) return ip;
  }

  const hops = headers.get("x-forwarded-for")?.split(",") ?? [];
  const last = cleanIp(hops[hops.length - 1]);
  if (last) return last;

  if (process.env.NODE_ENV === "production") {
    return "unknown";
  }
  return "local";
}

export function takeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  pruneBuckets(now);
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

function allowedOrigins(request: Request): Set<string> {
  const allowed = new Set<string>();
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (site) allowed.add(site);

  // Only trust Host when it matches the configured site (or localhost in dev).
  // Prevents Host-header spoofing from expanding the Origin allowlist.
  const host = request.headers.get("host")?.trim()?.toLowerCase();
  if (host) {
    if (site) {
      try {
        const siteHost = new URL(site).host.toLowerCase();
        if (host === siteHost) {
          allowed.add(`http://${host}`);
          allowed.add(`https://${host}`);
        }
      } catch {
        /* ignore bad NEXT_PUBLIC_SITE_URL */
      }
    }
    if (process.env.NODE_ENV !== "production" && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
      allowed.add(`http://${host}`);
      allowed.add(`https://${host}`);
    }
  }

  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }
  return allowed;
}

export function isTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  if (!origin && !referer) {
    return process.env.NODE_ENV !== "production";
  }
  const raw = origin || referer;
  try {
    const url = new URL(raw!);
    return allowedOrigins(request).has(`${url.protocol}//${url.host}`);
  } catch {
    return false;
  }
}

export function isKnownWeakPassword(password: string): boolean {
  return WEAK_PASSWORDS.has(password.trim().toLowerCase());
}

export function isPasswordStrongEnough(password: string): boolean {
  const trimmed = password.trim();
  if (trimmed.length < MIN_PASSWORD_LENGTH) return false;
  if (isKnownWeakPassword(trimmed)) return false;
  return true;
}

export function digitsIn(value: string): number {
  return value.replace(/\D/g, "").length;
}
