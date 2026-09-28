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

function pruneBuckets(now: number) {
  if (buckets.size < 200) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Client IP for rate limits. In production, refuse to collapse everyone
 * onto one bucket — that made spray attacks look like a single client.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;

  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;

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
    } else if (process.env.NODE_ENV !== "production") {
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
