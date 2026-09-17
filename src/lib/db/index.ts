import "server-only";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "binbus.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
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
    created_at TEXT NOT NULL
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
    created_at TEXT NOT NULL
  );
`);

const bookingCols = sqlite.prepare("PRAGMA table_info(bookings)").all() as {
  name: string;
}[];
if (!bookingCols.some((c) => c.name === "vehicle")) {
  sqlite.exec("ALTER TABLE bookings ADD COLUMN vehicle TEXT");
}

const defaults = [
  ["capacity_am", "8"],
  ["capacity_pm", "8"],
] as const;

for (const [key, value] of defaults) {
  sqlite
    .prepare(
      "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
    )
    .run(key, value);
}

export const db = drizzle(sqlite, { schema });
export { sqlite };
