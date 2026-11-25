"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminDashboard } from "@/components/AdminDashboard";
import {
  estimatePrice,
  packageLabel,
  vehicleLabel,
  type Frequency,
  type PackageId,
  type SizeId,
} from "@/lib/constants";

type Booking = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  suburb: string;
  address: string;
  binTypes: string;
  vehicle: string | null;
  frequency: string;
  date: string;
  slot: string;
  notes: string | null;
  status: string;
  createdAt: string;
};

type Blocked = { id: number; date: string; reason: string | null };

type Inquiry = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  suburb: string | null;
  message: string;
  createdAt: string;
};

type DeskView = "today" | "tomorrow" | "week" | "upcoming" | "past" | "cancelled";

function isoDate(d: Date): string {
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function shiftIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return isoDate(new Date(y, m - 1, d + days));
}

function whenLabel(date: string, today: string): string {
  if (date === today) return "Today";
  if (date === shiftIso(today, 1)) return "Tomorrow";
  if (date === shiftIso(today, -1)) return "Yesterday";
  return date;
}

function slotWord(slot: string): string {
  return slot === "am" ? "Morning" : slot === "pm" ? "Afternoon" : slot;
}

function jobBits(b: Booking): { packages: string[]; price: number | null } {
  let packages: string[] = [];
  try {
    packages = JSON.parse(b.binTypes);
  } catch {
    packages = [b.binTypes];
  }
  const pkg = packages[0] as PackageId | undefined;
  const size = b.vehicle as SizeId | null;
  const freq = b.frequency as Frequency;
  let price: number | null = null;
  if (pkg && size) {
    try {
      const next = estimatePrice(pkg, size, freq);
      price = Number.isFinite(next) ? next : null;
    } catch {
      price = null;
    }
  }
  return { packages, price };
}

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function AdminPanel({ initiallyAuthed }: { initiallyAuthed: boolean }) {
  const [authed, setAuthed] = useState(initiallyAuthed);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [blocked, setBlocked] = useState<Blocked[]>([]);
  const [am, setAm] = useState(8);
  const [pm, setPm] = useState(8);
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(initiallyAuthed);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<DeskView>("upcoming");
  const [sortDesc, setSortDesc] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, blRes, sRes, iRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/blocked"),
        fetch("/api/admin/settings"),
        fetch("/api/admin/inquiries"),
      ]);
      if (bRes.status === 401) {
        setAuthed(false);
        return;
      }
      const bData = await bRes.json();
      const blData = await blRes.json();
      const sData = await sRes.json();
      const iData = await iRes.json();
      setBookings(bData.bookings || []);
      setBlocked(blData.dates || []);
      setAm(sData.am ?? 8);
      setPm(sData.pm ?? 8);
      setInquiries(iData.inquiries || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) void load();
  }, [authed, load]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      document.getElementById("desk-search")?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setLoginError(data.error || "Login failed");
      return;
    }
    setPassword("");
    setAuthed(true);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  }

  async function cancel(id: number) {
    if (!confirm(`Cancel booking #${id}?`)) return;
    const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMsg(`Cancelled #${id}`);
      await load();
    }
  }

  async function saveCapacity(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ am, pm }),
    });
    if (res.ok) setMsg("Capacity saved");
  }

  async function blockTomorrow() {
    const today = isoDate(new Date());
    const date = shiftIso(today, 1);
    const res = await fetch("/api/admin/blocked", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, reason: "Blocked from the desk" }),
    });
    if (res.ok) {
      setMsg(`Tomorrow blocked (${date})`);
      await load();
    }
  }

  async function addBlock(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/blocked", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: blockDate, reason: blockReason }),
    });
    if (res.ok) {
      setBlockDate("");
      setBlockReason("");
      setMsg("Date blocked");
      await load();
    }
  }

  async function removeBlock(date: string) {
    const res = await fetch(`/api/admin/blocked?date=${date}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMsg("Date unblocked");
      await load();
    }
  }

  if (!authed) {
    return (
      <form onSubmit={login} className="card mx-auto max-w-md space-y-4 p-6">
        <h1 className="font-display text-2xl font-semibold">Admin login</h1>
        <p className="text-sm text-ink-soft">
          Ops desk for the operator only. Contact the site owner if you need
          access.
        </p>
        <div>
          <label className="label" htmlFor="admin-pass">
            Password
          </label>
          <input
            id="admin-pass"
            name="password"
            type="password"
            className="field"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {loginError && (
          <p className="text-sm text-danger" role="alert">
            {loginError}
          </p>
        )}
        <button type="submit" className="btn btn-primary w-full">
          Sign in
        </button>
      </form>
    );
  }

  const today = isoDate(new Date());
  const tomorrow = shiftIso(today, 1);
  const weekEnd = shiftIso(today, 6);
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");
  const todayJobs = confirmed.filter((b) => b.date === today);
  const tomorrowJobs = confirmed.filter((b) => b.date === tomorrow);
  const weekJobs = confirmed.filter((b) => b.date >= today && b.date <= weekEnd);
  const todayAm = todayJobs.filter((b) => b.slot === "am").length;
  const todayPm = todayJobs.filter((b) => b.slot === "pm").length;
  const weekTake = weekJobs.reduce((sum, b) => sum + (jobBits(b).price ?? 0), 0);
  const needle = query.trim().toLowerCase();

  const viewed = bookings.filter((b) => {
    if (view === "cancelled") return b.status === "cancelled";
    if (b.status !== "confirmed") return false;
    if (view === "today") return b.date === today;
    if (view === "tomorrow") return b.date === tomorrow;
    if (view === "week") return b.date >= today && b.date <= weekEnd;
    if (view === "past") return b.date < today;
    return b.date >= today;
  });

  const rows = viewed
    .filter((b) => {
      if (!needle) return true;
      const blob = [
        b.id,
        b.name,
        b.phone,
        b.email,
        b.suburb,
        b.address,
        b.notes,
        b.date,
        b.frequency,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(needle);
    })
    .sort((a, b) => {
      const cmp = `${a.date}${a.slot}`.localeCompare(`${b.date}${b.slot}`);
      return sortDesc ? -cmp : cmp;
    });

  const views: { id: DeskView; label: string; count: number }[] = [
    { id: "today", label: "Today", count: todayJobs.length },
    { id: "tomorrow", label: "Tomorrow", count: tomorrowJobs.length },
    { id: "week", label: "This week", count: weekJobs.length },
    { id: "upcoming", label: "Upcoming", count: confirmed.filter((b) => b.date >= today).length },
    { id: "past", label: "Past", count: confirmed.filter((b) => b.date < today).length },
    { id: "cancelled", label: "Cancelled", count: cancelled.length },
  ];

  return (
    <div className="desk space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Ops desk</h1>
          <p className="text-sm text-ink-soft">
            Bookings, inquiries, blocked days, capacity
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => load()}>
            Refresh
          </button>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      {msg && (
        <p className="rounded-xl bg-fresh/15 px-3 py-2 text-sm font-medium text-fresh-deep">
          {msg}
        </p>
      )}

      <AdminDashboard bookings={bookings} />

      <section className="desk-stats" aria-label="Desk stats">
        <button type="button" className={`desk-stat${view === "today" ? " is-on" : ""}`} onClick={() => setView("today")}>
          <span>Today</span>
          <strong>{todayJobs.length}</strong>
          <em>Morning {todayAm}/{am} · Afternoon {todayPm}/{pm}</em>
        </button>
        <button type="button" className={`desk-stat${view === "tomorrow" ? " is-on" : ""}`} onClick={() => setView("tomorrow")}>
          <span>Tomorrow</span>
          <strong>{tomorrowJobs.length}</strong>
          <em>{tomorrowJobs.length === 0 ? "Clear day" : "On the book"}</em>
        </button>
        <button type="button" className={`desk-stat${view === "week" ? " is-on" : ""}`} onClick={() => setView("week")}>
          <span>This week</span>
          <strong>{weekJobs.length}</strong>
          <em>{weekTake > 0 ? `About $${weekTake} if they all run` : "No priced jobs yet"}</em>
        </button>
        <button type="button" className="desk-stat" onClick={() => document.getElementById("desk-inquiries")?.scrollIntoView({ behavior: "smooth" })}>
          <span>Inquiries</span>
          <strong>{inquiries.length}</strong>
          <em>{inquiries.length === 0 ? "Inbox clear" : "Waiting on a reply"}</em>
        </button>
      </section>

      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2">
            <form onSubmit={saveCapacity} className="card space-y-3 p-5">
              <h2 className="font-display text-xl font-semibold">
                Jobs per slot
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="cap-am">
                    Morning
                  </label>
                  <input
                    id="cap-am"
                    type="number"
                    min={1}
                    max={40}
                    className="field"
                    value={am}
                    onChange={(e) => setAm(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="cap-pm">
                    Afternoon
                  </label>
                  <input
                    id="cap-pm"
                    type="number"
                    min={1}
                    max={40}
                    className="field"
                    value={pm}
                    onChange={(e) => setPm(Number(e.target.value))}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                Save capacity
              </button>
            </form>

            <form onSubmit={addBlock} className="card space-y-3 p-5">
              <h2 className="font-display text-xl font-semibold">Block a day</h2>
              <div>
                <label className="label" htmlFor="block-date">
                  Date
                </label>
                <input
                  id="block-date"
                  type="date"
                  className="field"
                  required
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="block-reason">
                  Reason (optional)
                </label>
                <input
                  id="block-reason"
                  className="field"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Public holiday / leave"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className="btn btn-accent">
                  Block date
                </button>
                <button type="button" className="btn btn-ghost" onClick={blockTomorrow}>
                  Block tomorrow
                </button>
              </div>
              {blocked.length > 0 && (
                <ul className="mt-2 space-y-2 border-t border-line pt-3">
                  {blocked.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span>
                        <strong>{b.date}</strong>
                        {b.reason ? ` · ${b.reason}` : ""}
                      </span>
                      <button
                        type="button"
                        className="font-semibold text-danger"
                        onClick={() => removeBlock(b.date)}
                      >
                        Unblock
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </form>
          </section>

          <section id="desk-inquiries">
            <h2 className="font-display text-2xl font-semibold">
              Inquiries ({inquiries.length})
            </h2>
            <div className="mt-4 space-y-3">
              {inquiries.length === 0 ? (
                <p className="text-sm text-ink-soft">No inquiries yet.</p>
              ) : (
                inquiries.slice(0, 40).map((row) => (
                  <article
                    key={row.id}
                    className="rounded-xl border border-line bg-paper p-4 text-sm"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-semibold">
                        #{row.id} · {row.name}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {row.createdAt.slice(0, 16).replace("T", " ")}
                      </p>
                    </div>
                    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      <a href={`tel:${row.phone}`} className="text-fresh-deep">
                        Call
                      </a>
                      <a href={`sms:${row.phone}`} className="text-fresh-deep">
                        Text
                      </a>
                      <button
                        type="button"
                        className="font-semibold text-fresh-deep"
                        onClick={async () => {
                          const ok = await copyText(
                            `${row.name}\n${row.phone}\n${row.message}`,
                          );
                          setMsg(ok ? `Copied inquiry #${row.id}` : "Copy failed");
                        }}
                      >
                        Copy
                      </button>
                      <span>
                        {row.phone}
                        {row.email ? ` · ${row.email}` : ""}
                        {row.suburb ? ` · ${row.suburb}` : ""}
                      </span>
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-ink-soft">
                      {row.message}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold">
                Bookings ({rows.length})
              </h2>
              <button
                type="button"
                className="text-sm font-semibold text-fresh-deep"
                onClick={() => setSortDesc((v) => !v)}
              >
                {sortDesc ? "Latest first" : "Soonest first"}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {views.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={view === item.id}
                  className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                    view === item.id
                      ? "border-fresh bg-fresh/15 text-fresh-deep"
                      : "border-line text-ink-soft"
                  }`}
                  onClick={() => setView(item.id)}
                >
                  {item.label} {item.count}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <label className="label" htmlFor="desk-search">
                Search jobs
              </label>
              <input
                id="desk-search"
                className="field"
                value={query}
                placeholder="Name, phone, suburb, address, notes…  press /"
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                    <th className="py-2 pr-3">When</th>
                    <th className="py-2 pr-3">Customer</th>
                    <th className="py-2 pr-3">Place</th>
                    <th className="py-2 pr-3">Job</th>
                    <th className="py-2"> </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => {
                    const { packages, price } = jobBits(b);
                    const place = `${b.address}, ${b.suburb}`;
                    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
                    return (
                      <tr key={b.id} className="border-b border-line/70 align-top">
                        <td className="py-3 pr-3">
                          <div className="font-semibold">
                            {whenLabel(b.date, today)} · {slotWord(b.slot)}
                          </div>
                          <div className="text-xs text-ink-soft">
                            {b.date} · #{b.id}
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="font-semibold">{b.name}</div>
                          <div className="text-xs">{b.phone}</div>
                          <div className="mt-1 flex flex-wrap gap-x-2 text-xs font-semibold">
                            <a href={`tel:${b.phone}`} className="text-fresh-deep">
                              Call
                            </a>
                            <a href={`sms:${b.phone}`} className="text-fresh-deep">
                              Text
                            </a>
                            <button
                              type="button"
                              className="text-fresh-deep"
                              onClick={async () => {
                                const ok = await copyText(b.phone);
                                setMsg(ok ? `Copied ${b.phone}` : "Copy failed");
                              }}
                            >
                              Copy number
                            </button>
                          </div>
                          {b.email && (
                            <div className="text-xs text-ink-soft">{b.email}</div>
                          )}
                        </td>
                        <td className="py-3 pr-3">
                          <div>{b.address}</div>
                          <div className="text-ink-soft">{b.suburb}</div>
                          <div className="mt-1 flex flex-wrap gap-x-2 text-xs font-semibold">
                            <a href={maps} target="_blank" rel="noreferrer" className="text-fresh-deep">
                              Map
                            </a>
                            <button
                              type="button"
                              className="text-fresh-deep"
                              onClick={async () => {
                                const ok = await copyText(place);
                                setMsg(ok ? "Copied address" : "Copy failed");
                              }}
                            >
                              Copy address
                            </button>
                          </div>
                          {b.notes && (
                            <div className="mt-1 text-xs italic text-ink-soft">
                              {b.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-3 pr-3">
                          {b.frequency}
                          <div className="text-xs text-ink-soft">
                            {b.vehicle ? `${vehicleLabel(b.vehicle)} · ` : ""}
                            {packages.map(packageLabel).join(", ")}
                          </div>
                          {price != null && (
                            <div className="text-xs font-semibold">${price}</div>
                          )}
                        </td>
                        <td className="py-3">
                          {b.status === "confirmed" ? (
                            <button
                              type="button"
                              className="text-sm font-semibold text-danger"
                              onClick={() => cancel(b.id)}
                            >
                              Cancel
                            </button>
                          ) : (
                            <span className="text-xs uppercase text-ink-soft">
                              Cancelled
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {rows.length === 0 && (
                <p className="mt-4 text-sm text-ink-soft">
                  Nothing in this view{needle ? " for that search" : ""}.
                </p>
              )}
            </div>
          </section>

          {view !== "cancelled" && cancelled.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink-soft">
                Cancelled ({cancelled.length})
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                {cancelled.slice(0, 8).map((b) => (
                  <li key={b.id}>
                    #{b.id} · {b.date} {slotWord(b.slot)} · {b.name} · {b.suburb}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
