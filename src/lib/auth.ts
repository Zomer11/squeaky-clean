import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { sqlite } from "@/lib/db";
import { isValidPasswordHash, verifyPasswordHash } from "@/lib/password";
import { clientIpFromHeaders, isPasswordStrongEnough } from "@/lib/security";
import { isValidTotpSecret, matchTotp } from "@/lib/totp";

const IS_PROD = process.env.NODE_ENV === "production";
/** `__Host-` makes the browser refuse the cookie unless Secure, path=/, no Domain. */
const COOKIE = IS_PROD ? "__Host-acd_admin" : "acd_admin";

const MINUTE = 60 * 1000;
const ABSOLUTE_TTL = 8 * 60 * MINUTE;
const IDLE_TTL = 30 * MINUTE;
const TOUCH_EVERY = MINUTE;
const MAX_SESSIONS = 5;

const IP_FAIL_LIMIT = 5;
const IP_FAIL_WINDOW = 15 * MINUTE;
const GLOBAL_FAIL_LIMIT = 50;
const GLOBAL_FAIL_WINDOW = 60 * MINUTE;
const EVENT_RETENTION = 90 * 24 * 60 * MINUTE;

type AdminConfig = {
  passwordHash: string | null;
  plainPassword: string | null;
  totpSecret: string | null;
};

function readConfig(): AdminConfig {
  return {
    passwordHash: process.env.ADMIN_PASSWORD_HASH?.trim() || null,
    plainPassword: process.env.ADMIN_PASSWORD?.trim() || null,
    totpSecret: process.env.ADMIN_TOTP_SECRET?.trim().replace(/\s/g, "") || null,
  };
}

/** Human-readable reason the desk can't be used, or null when it's good to go. */
export function adminConfigProblem(): string | null {
  const cfg = readConfig();
  if (cfg.passwordHash) {
    if (!isValidPasswordHash(cfg.passwordHash)) {
      return "ADMIN_PASSWORD_HASH is malformed. Re-run `npm run admin:setup`.";
    }
  } else if (IS_PROD) {
    return "ADMIN_PASSWORD_HASH is required in production. Run `npm run admin:setup`.";
  } else if (!cfg.plainPassword || !isPasswordStrongEnough(cfg.plainPassword)) {
    return "Set ADMIN_PASSWORD_HASH (run `npm run admin:setup`), or a 16+ character ADMIN_PASSWORD for local dev.";
  }

  if (cfg.totpSecret) {
    if (!isValidTotpSecret(cfg.totpSecret)) {
      return "ADMIN_TOTP_SECRET is not a valid base32 secret. Re-run `npm run admin:setup`.";
    }
  } else if (IS_PROD) {
    return "ADMIN_TOTP_SECRET (two-factor) is required in production. Run `npm run admin:setup`.";
  }
  return null;
}

/**
 * Optional ADMIN_ALLOWED_IPS (comma-separated exact IPs). When set, the desk
 * simply doesn't exist for anyone else — not even the login form.
 */
export function adminIpAllowed(ip: string): boolean {
  const list = process.env.ADMIN_ALLOWED_IPS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!list || list.length === 0) return true;
  return list.includes(ip);
}

export async function adminRequestAllowed(): Promise<boolean> {
  return adminIpAllowed(clientIpFromHeaders(await headers()));
}

export function adminConfigured(): boolean {
  return adminConfigProblem() === null;
}

export function totpRequired(): boolean {
  return Boolean(readConfig().totpSecret);
}

/** Changes whenever the password or 2FA secret is rotated, which kills every open session. */
function configFingerprint(): string {
  const cfg = readConfig();
  return sha256(`${cfg.passwordHash ?? cfg.plainPassword ?? ""}|${cfg.totpSecret ?? ""}`);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

const compareKey = randomBytes(32);
function equalStrings(a: string, b: string): boolean {
  const da = createHmac("sha256", compareKey).update(a).digest();
  const db = createHmac("sha256", compareKey).update(b).digest();
  return timingSafeEqual(da, db);
}

/** Atomically burns a TOTP time-step so a sniffed code can't be replayed. */
function claimTotpCounter(counter: number): boolean {
  sqlite
    .prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_totp_last', '0')")
    .run();
  const res = sqlite
    .prepare(
      "UPDATE settings SET value = ? WHERE key = 'admin_totp_last' AND CAST(value AS INTEGER) < ?",
    )
    .run(String(counter), counter);
  return res.changes === 1;
}

export async function verifyCredentials(password: string, code: string): Promise<boolean> {
  const cfg = readConfig();
  let passwordOk = false;
  if (cfg.passwordHash) {
    passwordOk = await verifyPasswordHash(password, cfg.passwordHash);
  } else if (cfg.plainPassword && !IS_PROD) {
    passwordOk = equalStrings(password, cfg.plainPassword);
  }

  if (!cfg.totpSecret) return passwordOk;

  const counter = matchTotp(cfg.totpSecret, code.trim());
  // Only burn the code when the password was right, so a guesser can't eat the owner's code.
  return passwordOk && counter !== null && claimTotpCounter(counter);
}

async function userAgent(): Promise<string> {
  return ((await headers()).get("user-agent") ?? "").slice(0, 300);
}

export async function createAdminSession(ip: string): Promise<void> {
  const now = Date.now();
  const token = randomBytes(32).toString("base64url");
  const ua = await userAgent();

  sqlite.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").run(now);
  sqlite
    .prepare(
      `INSERT INTO admin_sessions (token_hash, fingerprint, ua_hash, ip, created_at, last_seen, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(sha256(token), configFingerprint(), sha256(ua), ip, now, now, now + ABSOLUTE_TTL);
  sqlite
    .prepare(
      `DELETE FROM admin_sessions WHERE token_hash NOT IN (
         SELECT token_hash FROM admin_sessions ORDER BY created_at DESC LIMIT ?
       )`,
    )
    .run(MAX_SESSIONS);

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: IS_PROD,
    path: "/",
    maxAge: ABSOLUTE_TTL / 1000,
    priority: "high",
  });
}

type SessionRow = {
  token_hash: string;
  fingerprint: string;
  ua_hash: string;
  last_seen: number;
  expires_at: number;
};

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!(await adminRequestAllowed())) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length > 100) return false;

  const tokenHash = sha256(token);
  const row = sqlite
    .prepare(
      "SELECT token_hash, fingerprint, ua_hash, last_seen, expires_at FROM admin_sessions WHERE token_hash = ?",
    )
    .get(tokenHash) as SessionRow | undefined;
  if (!row) return false;

  const now = Date.now();
  const valid =
    row.expires_at > now &&
    row.last_seen + IDLE_TTL > now &&
    row.fingerprint === configFingerprint() &&
    row.ua_hash === sha256(await userAgent());

  if (!valid) {
    sqlite.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").run(tokenHash);
    return false;
  }
  if (now - row.last_seen > TOUCH_EVERY) {
    sqlite.prepare("UPDATE admin_sessions SET last_seen = ? WHERE token_hash = ?").run(now, tokenHash);
  }
  return true;
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    sqlite.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").run(sha256(token));
  }
  jar.delete(COOKIE);
}

export async function clearAllAdminSessions(): Promise<void> {
  sqlite.prepare("DELETE FROM admin_sessions").run();
  (await cookies()).delete(COOKIE);
}

export type AuthEvent =
  | "login_ok"
  | "login_failed"
  | "rate_limited"
  | "locked_out"
  | "forbidden_origin"
  | "not_configured"
  | "logout"
  | "logout_all";

export async function recordAuthEvent(event: AuthEvent, ip: string): Promise<void> {
  const now = Date.now();
  sqlite
    .prepare("INSERT INTO admin_auth_events (at, event, ip, ua) VALUES (?, ?, ?, ?)")
    .run(now, event, ip, await userAgent());
  if (Math.random() < 0.02) {
    sqlite.prepare("DELETE FROM admin_auth_events WHERE at < ?").run(now - EVENT_RETENTION);
  }
  console.info(JSON.stringify({ type: "admin.auth", event, ip, at: new Date(now).toISOString() }));
}

function countFailures(since: number, ip?: string): number {
  const row = ip
    ? sqlite
        .prepare(
          "SELECT COUNT(*) AS n FROM admin_auth_events WHERE event = 'login_failed' AND at > ? AND ip = ?",
        )
        .get(since, ip)
    : sqlite
        .prepare("SELECT COUNT(*) AS n FROM admin_auth_events WHERE event = 'login_failed' AND at > ?")
        .get(since);
  return (row as { n: number }).n;
}

/**
 * Persistent limits (survive restarts/redeploys): 5 fails per IP per 15 min,
 * and a global brake of 50 fails per hour against IP-rotating attacks.
 */
export function loginLockout(ip: string): "ip" | "global" | null {
  const now = Date.now();
  if (countFailures(now - IP_FAIL_WINDOW, ip) >= IP_FAIL_LIMIT) return "ip";
  if (countFailures(now - GLOBAL_FAIL_WINDOW) >= GLOBAL_FAIL_LIMIT) return "global";
  return null;
}

export type AuthEventRow = { at: number; event: string; ip: string | null; ua: string | null };

export function recentAuthEvents(limit = 15): AuthEventRow[] {
  return sqlite
    .prepare("SELECT at, event, ip, ua FROM admin_auth_events ORDER BY at DESC LIMIT ?")
    .all(limit) as AuthEventRow[];
}

export function activeSessionCount(): number {
  const now = Date.now();
  const row = sqlite
    .prepare("SELECT COUNT(*) AS n FROM admin_sessions WHERE expires_at > ? AND last_seen > ?")
    .get(now, now - IDLE_TTL) as { n: number };
  return row.n;
}
