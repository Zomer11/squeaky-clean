"use client";

import { useCallback, useEffect, useState } from "react";
import { packageLabel, vehicleLabel } from "@/lib/constants";

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

export function AdminPanel({ initiallyAuthed }: { initiallyAuthed: boolean }) {
  const [authed, setAuthed] = useState(initiallyAuthed);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blocked, setBlocked] = useState<Blocked[]>([]);
  const [am, setAm] = useState(8);
  const [pm, setPm] = useState(8);
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(initiallyAuthed);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, blRes, sRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/blocked"),
        fetch("/api/admin/settings"),
      ]);
      if (bRes.status === 401) {
        setAuthed(false);
        return;
      }
      const bData = await bRes.json();
      const blData = await blRes.json();
      const sData = await sRes.json();
      setBookings(bData.bookings || []);
      setBlocked(blData.dates || []);
      setAm(sData.am ?? 8);
      setPm(sData.pm ?? 8);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) void load();
  }, [authed, load]);

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
          Password is in <code className="text-xs">.env.local</code> (
          <code className="text-xs">ADMIN_PASSWORD</code>).
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

  const upcoming = bookings.filter((b) => b.status === "confirmed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Ops desk</h1>
          <p className="text-sm text-ink-soft">Bookings, blocked days, capacity</p>
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
              <button type="submit" className="btn btn-accent">
                Block date
              </button>
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

          <section>
            <h2 className="font-display text-2xl font-semibold">
              Bookings ({upcoming.length} active)
            </h2>
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
                  {upcoming.map((b) => {
                    let packages: string[] = [];
                    try {
                      packages = JSON.parse(b.binTypes);
                    } catch {
                      packages = [b.binTypes];
                    }
                    return (
                      <tr key={b.id} className="border-b border-line/70 align-top">
                        <td className="py-3 pr-3">
                          <div className="font-semibold">
                            {b.date} · {b.slot.toUpperCase()}
                          </div>
                          <div className="text-xs text-ink-soft">#{b.id}</div>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="font-semibold">{b.name}</div>
                          <a href={`tel:${b.phone}`} className="text-fresh-deep">
                            {b.phone}
                          </a>
                          {b.email && (
                            <div className="text-xs text-ink-soft">{b.email}</div>
                          )}
                        </td>
                        <td className="py-3 pr-3">
                          <div>{b.address}</div>
                          <div className="text-ink-soft">{b.suburb}</div>
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
                        </td>
                        <td className="py-3">
                          <button
                            type="button"
                            className="text-sm font-semibold text-danger"
                            onClick={() => cancel(b.id)}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {upcoming.length === 0 && (
                <p className="mt-4 text-sm text-ink-soft">No active bookings yet.</p>
              )}
            </div>
          </section>

          {cancelled.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink-soft">
                Cancelled ({cancelled.length})
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                {cancelled.slice(0, 20).map((b) => (
                  <li key={b.id}>
                    #{b.id} · {b.date} {b.slot} · {b.name} · {b.suburb}
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
