import "server-only";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

function resolveDbPath(): string {
  const fromEnv = process.env.DATABASE_PATH?.trim();
  if (fromEnv) {
    return path.isAbsolute(fromEnv)
      ? fromEnv
      : path.join(process.cwd(), fromEnv);
  }
  return path.join(process.cwd(), "data", "binbus.db");
}

const dbPath = resolveDbPath();
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (
  process.env.NODE_ENV === "production" &&
  process.env.VERCEL &&
  !process.env.DATABASE_PATH?.trim()
) {
  console.warn(
    "[db] Vercel filesystem is ephemeral and DATABASE_PATH is unset. Bookings will be lost on redeploy. Use Turso/Postgres or a host with a persistent volume.",
  );
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    suburb TEXT NOT NULL,
    address TEXT NOT NULL,
    bin_types TEXT NOT NULL,
    frequency TEXT NOT NULL,
    date TEXT NOT NULL,
    slot TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed',
    created_at TEXT NOT NULL,
    consented_at TEXT
  );

  CREATE TABLE IF NOT EXISTS blocked_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    reason TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    suburb TEXT,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL,
    consented_at TEXT
  );
`);

function ensureColumn(table: string, column: string, ddl: string) {
  const cols = sqlite.prepare(`PRAGMA table_info(${table})`).all() as {
    name: string;
  }[];
  if (!cols.some((c) => c.name === column)) {
    sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}

ensureColumn("bookings", "vehicle", "vehicle TEXT");
ensureColumn("bookings", "consented_at", "consented_at TEXT");
ensureColumn("inquiries", "consented_at", "consented_at TEXT");

const defaults = [
  ["capacity_am", "8"],
  ["capacity_pm", "8"],
] as const;

for (const [key, value] of defaults) {
  sqlite
    .prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)")
    .run(key, value);
}

export const db = drizzle(sqlite, { schema });
export { sqlite, dbPath };
