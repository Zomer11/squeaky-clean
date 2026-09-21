"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  COMBINED_PACKAGES,
  EXTERIOR_PACKAGES,
  FREQUENCIES,
  INTERIOR_PACKAGES,
  PACKAGES,
  SIZES,
  estimatePrice,
  isMaintenance,
  packageLabel,
  resolvePackageId,
  vehicleLabel,
  type Frequency,
  type PackageId,
  type Slot,
  type VehicleId,
} from "@/lib/constants";
import { FormConsent } from "@/components/FormConsent";
import { SUBURBS } from "@/lib/suburbs";
import { THANKS_STORAGE_KEY } from "@/lib/thanks";

type SlotInfo = {
  date: string;
  slot: Slot;
  capacity: number;
  booked: number;
  remaining: number;
  open: boolean;
};

type Props = {
  initialSlots: SlotInfo[];
  initialSuburb?: string;
  initialPackage?: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
] as const;

function matchSuburb(raw: string): string {
  const needle = raw.trim().toLowerCase();
  return SUBURBS.find((s) => s.name.toLowerCase() === needle)?.name ?? "";
}

function dayLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS[weekday]}, ${d} ${MONTHS[m - 1]}`;
}

export function BookingForm({
  initialSlots,
  initialSuburb = "",
  initialPackage = "good",
}: Props) {
  const router = useRouter();
  const [slots, setSlots] = useState(initialSlots);
  const [vehicle, setVehicle] = useState<VehicleId>("medium");
  const [packageId, setPackageId] = useState<PackageId>(() =>
    resolvePackageId(initialPackage),
  );
  const [frequency, setFrequency] = useState<Frequency>(() =>
    resolvePackageId(initialPackage) === "maintenance"
      ? "fortnightly"
      : "one-off",
  );
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<Slot | "">("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [suburb, setSuburb] = useState(() => matchSuburb(initialSuburb));
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [suburbQuery, setSuburbQuery] = useState(suburb);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [activeSug, setActiveSug] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  const openDates = useMemo(() => {
    const map = new Map<string, { am?: SlotInfo; pm?: SlotInfo }>();
    for (const s of slots) {
      if (!s.open) continue;
      const entry = map.get(s.date) || {};
      entry[s.slot] = s;
      map.set(s.date, entry);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [slots]);

  const suggestions = useMemo(() => {
    const q = suburbQuery.trim().toLowerCase();
    if (!q) return [];
    return SUBURBS.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 8);
  }, [suburbQuery]);

  useEffect(() => {
    setActiveSug(0);
  }, [suggestions]);

  function pickSuburb(name: string) {
    setSuburb(name);
    setSuburbQuery(name);
    setShowSuggestions(false);
  }

  const price = estimatePrice(packageId, vehicle, frequency);
  const selectedDay = date ? openDates.find(([d]) => d === date)?.[1] : undefined;

  useEffect(() => {
    if (!date) return;
    const day = openDates.find(([d]) => d === date)?.[1];
    if (!day) {
      setDate("");
      setSlot("");
      return;
    }
    if (slot && !day[slot]?.open) setSlot("");
  }, [date, openDates, slot]);

  async function refreshSlots() {
    const start = new Date().toISOString().slice(0, 10);
    const res = await fetch(`/api/availability?start=${start}&days=42`);
    const data = await res.json();
    setSlots(data.slots);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!slot || !date) {
      setError("Pick a date and a morning or afternoon slot.");
      document.getElementById("slot-heading")?.focus();
      return;
    }
    if (!suburb) {
      setError("Choose a suburb from the list.");
      document.getElementById("suburb")?.focus();
      return;
    }
    if (!agreed) {
      setError("Tick the box to agree to the privacy policy and terms.");
      document.getElementById("book-consent")?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          suburb,
          address,
          vehicle,
          packageId,
          frequency,
          date,
          slot,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn’t book that slot.");
        await refreshSlots();
        return;
      }
      setSuccessId(data.id);
      try {
        sessionStorage.setItem(
          THANKS_STORAGE_KEY,
          JSON.stringify({
            kind: "booking",
            id: data.id,
            date,
            slot,
            price,
            vehicle: vehicleLabel(vehicle),
            package: packageLabel(packageId),
            suburb,
          }),
        );
      } catch {
        /* private mode */
      }
      router.push("/thanks?kind=booking");
      return;
    } catch {
      setError("Network hiccup — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (successId) {
    return (
      <div className="card noise p-6 md:p-8">
        <p className="chip">Booking #{successId}</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-ink">
          You’re on the run.
        </h2>
        <p className="mt-3 max-w-lg text-ink-soft">
          We’ll roll up on {date}{" "}
          {slot === "am" ? "morning" : "afternoon"}. Leave the car in the
          driveway with keys sorted. Pay on the day.
        </p>
        <ul className="mt-5 space-y-2 text-sm text-ink">
          <li>
            <strong>Estimate:</strong> ${price} for this visit
          </li>
          <li>
            <strong>Job:</strong> {packageLabel(packageId)} · {vehicleLabel(vehicle)}
          </li>
          <li>
            <strong>Address:</strong> {address}, {suburb}
          </li>
        </ul>
        <button
          type="button"
          className="btn btn-ghost mt-6"
          onClick={() => {
            setSuccessId(null);
            setNotes("");
          }}
        >
          Book another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card noise space-y-7 p-5 md:p-8">
      <section>
        <h2 className="font-display text-xl font-semibold">1. Size & package</h2>
        <fieldset className="mt-3">
          <legend className="label">Vehicle size</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {SIZES.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={vehicle === v.id}
                onClick={() => setVehicle(v.id)}
                className={`choice rounded-2xl border-2 p-3 text-left transition ${
                  vehicle === v.id
                    ? "border-ink bg-cream"
                    : "border-line bg-paper hover:border-ink/40"
                }`}
              >
                <span className="block text-sm font-bold">{v.label}</span>
                <span className="text-xs text-ink-soft">{v.blurb}</span>
              </button>
            ))}
          </div>
        </fieldset>
        {(
          [
            ["Combined visit", COMBINED_PACKAGES],
            ["Exterior only", EXTERIOR_PACKAGES],
            ["Interior only", INTERIOR_PACKAGES],
            ["Keep it going", PACKAGES.filter((p) => p.family === "maintenance")],
          ] as const
        ).map(([heading, list]) => (
          <fieldset key={heading} className="mt-4">
            <legend className="label">{heading}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {list.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={packageId === p.id}
                  onClick={() => {
                    setPackageId(p.id);
                    setFrequency(
                      p.id === "maintenance" ? "fortnightly" : "one-off",
                    );
                  }}
                  className={`choice rounded-2xl border-2 p-3 text-left ${
                    packageId === p.id
                      ? "border-fresh bg-fresh/10"
                      : "border-line bg-paper hover:border-ink/40"
                  }`}
                >
                  <span className="block text-sm font-bold">
                    {p.grade} · {p.label}
                  </span>
                  <span className="text-xs text-ink-soft">{p.blurb}</span>
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        {isMaintenance(packageId) ? (
          <fieldset className="mt-4">
            <legend className="label">How often</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {FREQUENCIES.filter((f) => f.id !== "one-off").map((f) => (
                <label
                  key={f.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-2xl border-2 p-3 ${
                    frequency === f.id
                      ? "border-sun bg-sun/15"
                      : "border-line bg-paper"
                  }`}
                >
                  <input
                    type="radio"
                    name="frequency"
                    className="mt-1 h-4 w-4 accent-sun-deep"
                    checked={frequency === f.id}
                    onChange={() => setFrequency(f.id)}
                  />
                  <span>
                    <span className="block text-sm font-bold">{f.label}</span>
                    <span className="text-xs text-ink-soft">{f.blurb}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <p className="mt-3 text-sm text-ink-soft">
            One visit. Standing slots live on the maintenance plan.
          </p>
        )}
        <p className="mt-3 text-sm font-semibold text-ink">
          Estimate: ${price}{" "}
          <span className="font-normal text-ink-soft">
            for this visit · pay on the day
          </span>
        </p>
      </section>

      <section>
        <h2
          id="slot-heading"
          tabIndex={-1}
          className="font-display text-xl font-semibold"
        >
          2. Pick a slot
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Morning or afternoon, every day including Sunday. We come to your
          driveway — not a shop drop-off.
        </p>
        {openDates.length === 0 ? (
          <p className="mt-3 rounded-xl bg-cream-deep p-4 text-sm">
            No open slots right now.{" "}
            <a href="/contact" className="font-semibold text-fresh-deep underline">
              Send an inquiry
            </a>
            .
          </p>
        ) : (
          <div className="mt-3 grid max-h-56 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
            {openDates.map(([d, day], i) => {
              const selected = date === d;
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setDate(d);
                    setSlot("");
                  }}
                  className={`cal-chip rounded-xl border-2 px-2 py-3 text-center text-sm font-semibold transition hover:-translate-y-0.5 ${
                    selected
                      ? "border-sun bg-sun/20"
                      : "border-line bg-paper hover:border-sun/50"
                  }`}
                  style={{ animationDelay: `${Math.min(i, 24) * 28}ms` }}
                >
                  {dayLabel(d)}
                  <span className="mt-1 block text-[0.65rem] font-medium text-ink-soft">
                    {[day.am && "AM", day.pm && "PM"].filter(Boolean).join(" · ")}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {selectedDay && (
          <div className="mt-3 flex gap-2">
            {(["am", "pm"] as Slot[]).map((s) => {
              const info = selectedDay[s];
              const disabled = !info?.open;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={disabled}
                  aria-pressed={slot === s}
                  onClick={() => setSlot(s)}
                  className={`choice flex-1 rounded-xl border-2 px-3 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 ${
                    slot === s
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-paper"
                  }`}
                >
                  {s === "am" ? "Morning" : "Afternoon"}
                  {info?.open && (
                    <span className="mt-1 block text-[0.65rem] font-medium opacity-80">
                      {info.remaining} left
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">3. Your driveway</h2>
        <div className="relative">
          <label className="label" htmlFor="suburb">
            Suburb
          </label>
          <input
            id="suburb"
            name="suburb"
            className="field"
            value={suburbQuery || suburb}
            onChange={(e) => {
              setSuburbQuery(e.target.value);
              setSuburb("");
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (!showSuggestions || suggestions.length === 0) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveSug((i) => (i + 1) % suggestions.length);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveSug((i) => (i - 1 + suggestions.length) % suggestions.length);
              } else if (e.key === "Enter") {
                e.preventDefault();
                pickSuburb(suggestions[activeSug].name);
              } else if (e.key === "Escape") {
                setShowSuggestions(false);
              }
            }}
            placeholder="e.g. West End…"
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showSuggestions && suggestions.length > 0}
            aria-controls="suburb-list"
            aria-activedescendant={
              showSuggestions && suggestions[activeSug]
                ? `suburb-opt-${suggestions[activeSug].name}`
                : undefined
            }
            required
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul
              id="suburb-list"
              role="listbox"
              className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-line bg-paper shadow-lg"
            >
              {suggestions.map((s, i) => (
                <li key={s.name} role="presentation">
                  <button
                    id={`suburb-opt-${s.name}`}
                    type="button"
                    role="option"
                    aria-selected={i === activeSug}
                    className={`w-full px-3 py-2 text-left text-sm ${
                      i === activeSug ? "bg-cream" : "hover:bg-cream"
                    }`}
                    onClick={() => pickSuburb(s.name)}
                  >
                    {s.name}{" "}
                    <span className="text-ink-soft">
                      · {s.region} {s.postcode}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="label" htmlFor="address">
            Street address
          </label>
          <input
            id="address"
            name="address"
            className="field"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            autoComplete="street-address"
            required
            placeholder="e.g. 12 Example St…"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              className="field"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email <span className="font-normal">(optional)</span>
          </label>
          <input
            id="email"
            name="email"
            className="field"
            type="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="notes">
            Notes{" "}
            <span className="font-normal">(car make, colour, dogs, hose tap)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            className="field min-h-24"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <FormConsent
          id="book-consent"
          checked={agreed}
          onChange={setAgreed}
        />
      </section>

      {error && (
        <p
          className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-danger"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
        {submitting ? "Booking…" : "Confirm booking"}
      </button>
    </form>
  );
}
