/**
 * Copy the SQLite DB to data/backups/ with a timestamp.
 * Run from the project root (or set DATABASE_PATH).
 *
 *   npm run db:backup
 *
 * Schedule this nightly on the host (cron / Task Scheduler).
 * Restore: stop the app, copy a backup over the live DB path, start again.
 */
const fs = require("fs");
const path = require("path");

function resolveDbPath() {
  const fromEnv = process.env.DATABASE_PATH?.trim();
  if (fromEnv) {
    return path.isAbsolute(fromEnv)
      ? fromEnv
      : path.join(process.cwd(), fromEnv);
  }
  return path.join(process.cwd(), "data", "binbus.db");
}

const dbPath = resolveDbPath();
if (!fs.existsSync(dbPath)) {
  console.error(`[db:backup] No database at ${dbPath}`);
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = path.join(path.dirname(dbPath), "backups");
fs.mkdirSync(backupDir, { recursive: true });
const dest = path.join(backupDir, `binbus-${stamp}.db`);

fs.copyFileSync(dbPath, dest);

// Also copy WAL/SHM if present so a hot copy is more consistent.
for (const suffix of ["-wal", "-shm"]) {
  const side = `${dbPath}${suffix}`;
  if (fs.existsSync(side)) {
    fs.copyFileSync(side, `${dest}${suffix}`);
  }
}

console.info(`[db:backup] Wrote ${dest}`);
