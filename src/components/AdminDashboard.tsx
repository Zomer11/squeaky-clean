"use client";

import {
  estimatePrice,
  packageLabel,
  type Frequency,
  type PackageId,
  type SizeId,
} from "@/lib/constants";

type Row = {
  status: string;
  date: string;
  slot: string;
  suburb: string;
  binTypes: string;
  vehicle: string | null;
  frequency: string;
};

function priceOf(row: Row): number {
  let packages: string[] = [];
  try {
    packages = JSON.parse(row.binTypes);
  } catch {
    packages = [row.binTypes];
  }
  const pkg = packages[0] as PackageId | undefined;
  const size = row.vehicle as SizeId | null;
  if (!pkg || !size) return 0;
  try {
    const next = estimatePrice(pkg, size, row.frequency as Frequency);
    return Number.isFinite(next) ? next : 0;
  } catch {
    return 0;
  }
}

function packageName(row: Row): string {
  try {
    const ids = JSON.parse(row.binTypes) as string[];
    return packageLabel(ids[0] || "");
  } catch {
    return packageLabel(row.binTypes);
  }
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-AU", { month: "short" });
}

function lastMonths(n: number): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return keys;
}

function weekStart(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function lastWeekStarts(n: number): string[] {
  const today = new Date();
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 7);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    keys.push(weekStart(iso));
  }
  return [...new Set(keys)];
}

function LineChart({
  points,
}: {
  points: { label: string; confirmed: number; cancelled: number }[];
}) {
  const w = 640;
  const h = 200;
  const pad = 22;
  const max = Math.max(1, ...points.flatMap((p) => [p.confirmed, p.cancelled]));
  const coords = points.map((p, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, points.length - 1);
    const yFor = (value: number) => h - pad - (value / max) * (h - pad * 2 - 10);
    return { ...p, x, yConfirmed: yFor(p.confirmed), yCancelled: yFor(p.cancelled) };
  });
  const line = (key: "yConfirmed" | "yCancelled") =>
    coords.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p[key]}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="dash-line" role="img" aria-label="Estimate by month">
      {[0.25, 0.5, 0.75, 1].map((step) => (
        <line
          key={step}
          x1={pad}
          x2={w - pad}
          y1={h - pad - step * (h - pad * 2 - 10)}
          y2={h - pad - step * (h - pad * 2 - 10)}
          stroke="rgba(212, 176, 122, 0.2)"
        />
      ))}
      <path d={line("yCancelled")} fill="none" stroke="#8a7560" strokeWidth="2" strokeDasharray="5 4" />
      <path d={line("yConfirmed")} fill="none" stroke="#d4b07a" strokeWidth="3" strokeLinejoin="round" />
      {coords.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.yCancelled} r="3.5" fill="#8a7560" />
          <circle cx={p.x} cy={p.yConfirmed} r="4" fill="#d4b07a" />
          <text x={p.x} y={h - 4} textAnchor="middle" fontSize="11" fill="#c9b89a">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Bars({
  points,
}: {
  points: { label: string; confirmed: number; cancelled: number }[];
}) {
  const max = Math.max(1, ...points.flatMap((p) => [p.confirmed, p.cancelled]));
  return (
    <div className="dash-bars" aria-label="Estimate by week">
      {points.map((p) => {
        const value = Math.max(p.confirmed, p.cancelled);
        return (
          <div key={p.label} className="dash-bar">
            <span
              className={p.confirmed > 0 ? "confirmed" : "cancelled"}
              style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
            />
            <em>{p.label}</em>
          </div>
        );
      })}
    </div>
  );
}

function Rank({ title, rows }: { title: string; rows: { label: string; count: number; money: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="dash-card">
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <p className="dash-empty">Nothing booked yet.</p>
      ) : (
        <ul className="dash-rank">
          {rows.map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <i>
                <b style={{ width: `${(row.count / max) * 100}%` }} />
              </i>
              <em>
                {row.count} · ${row.money}
              </em>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AdminDashboard({ bookings }: { bookings: Row[] }) {
  const live = bookings.filter((b) => b.status === "confirmed");
  const dropped = bookings.filter((b) => b.status === "cancelled");
  const sum = (rows: Row[]) => rows.reduce((total, row) => total + priceOf(row), 0);
  const months = lastMonths(6).map((key) => ({
    label: monthLabel(key),
    confirmed: sum(live.filter((b) => monthKey(b.date) === key)),
    cancelled: sum(dropped.filter((b) => monthKey(b.date) === key)),
  }));
  const weeks = lastWeekStarts(16).map((key) => ({
    label: key.slice(5),
    confirmed: sum(live.filter((b) => weekStart(b.date) === key)),
    cancelled: sum(dropped.filter((b) => weekStart(b.date) === key)),
  }));

  const tally = (pick: (row: Row) => string) => {
    const map = new Map<string, { count: number; money: number }>();
    for (const row of bookings) {
      const label = pick(row) || "Unknown";
      const current = map.get(label) ?? { count: 0, money: 0 };
      current.count += 1;
      current.money += priceOf(row);
      map.set(label, current);
    }
    return [...map.entries()]
      .map(([label, value]) => ({ label, ...value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const morning = bookings.filter((b) => b.slot === "am").length;
  const afternoon = bookings.filter((b) => b.slot === "pm").length;
  const split = Math.max(1, morning + afternoon);
  const booked = live.reduce((sum, row) => sum + priceOf(row), 0);

  return (
    <section className="dash">
      <div className="dash-kpis">
        <article>
          <span>Booked jobs</span>
          <strong>{live.length}</strong>
          <em>Confirmed only</em>
        </article>
        <article>
          <span>Booked estimate</span>
          <strong>${booked}</strong>
          <em>Not money in the bank</em>
        </article>
        <article>
          <span>Morning</span>
          <strong>{morning}</strong>
          <em>{Math.round((morning / split) * 100)}% of jobs on file</em>
        </article>
        <article>
          <span>Afternoon</span>
          <strong>{afternoon}</strong>
          <em>{Math.round((afternoon / split) * 100)}% of jobs on file</em>
        </article>
      </div>

      <div className="dash-grid">
        <section className="dash-card dash-wide">
          <h2>Estimate by month</h2>
          <p className="dash-key">
            <i className="gold" /> Confirmed
            <i className="muted" /> Cancelled, not sales
          </p>
          <LineChart points={months} />
        </section>
        <section className="dash-card">
          <h2>By week</h2>
          <Bars points={weeks} />
        </section>
        <Rank title="Packages" rows={tally(packageName)} />
        <Rank title="Suburbs" rows={tally((row) => row.suburb)} />
        <section className="dash-card">
          <h2>Morning vs afternoon</h2>
          <div className="dash-split" aria-hidden>
            <span style={{ width: `${(morning / split) * 100}%` }} />
            <span style={{ width: `${(afternoon / split) * 100}%` }} />
          </div>
          <p className="dash-split-key">
            <i className="am" /> Morning {morning}
            <i className="pm" /> Afternoon {afternoon}
          </p>
        </section>
      </div>
    </section>
  );
}
