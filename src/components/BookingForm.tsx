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

type Step = "job" | "when" | "driveway";

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

const STEPS: { id: Step; label: string }[] = [
  { id: "job", label: "The job" },
  { id: "when", label: "The day" },
  { id: "driveway", label: "You" },
];

const SIZE_HINT: Record<VehicleId, string> = {
  small: "Corolla, Mazda2",
  medium: "Camry, CX-5",
  large: "Prado, Ranger",
};

const JOB_PATHS = [
  {
    id: "combined" as const,
    title: "Inside + outside",
    blurb: "Both sides, one visit.",
  },
  {
    id: "exterior" as const,
    title: "Outside only",
    blurb: "Paint, glass, wheels.",
  },
  {
    id: "interior" as const,
    title: "Inside only",
    blurb: "Cabin, seats, glass.",
  },
  {
    id: "maintenance" as const,
    title: "Maintenance",
    blurb: "Keep a detail from sliding.",
  },
];

function matchSuburb(raw: string): string {
  const needle = raw.trim().toLowerCase();
  return SUBURBS.find((s) => s.name.toLowerCase() === needle)?.name ?? "";
}

function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

function sundayOf(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return addDays(date, -weekday);
}

function dayLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS[weekday]}, ${d} ${MONTHS[m - 1]}`;
}

function weekRangeLabel(start: string): string {
  const end = addDays(start, 6);
  const [, ms, ds] = start.split("-").map(Number);
  const [, me, de] = end.split("-").map(Number);
  if (ms === me) return `${ds}–${de} ${MONTHS[ms - 1]}`;
  return `${ds} ${MONTHS[ms - 1]} – ${de} ${MONTHS[me - 1]}`;
}

function scrollSheet(step: Step) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("book-sheet")?.scrollIntoView({
    block: "start",
    behavior: reduce ? "auto" : "smooth",
  });
  document.getElementById(`book-step-${step}`)?.focus();
}

function PackageButton({
  title,
  blurb,
  meta,
  selected,
  onPick,
}: {
  title: string;
  blurb: string;
  meta: string;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onPick}
      className={`choice rounded-2xl border-2 p-3 text-left ${
        selected
          ? "border-fresh bg-fresh/10"
          : "border-line bg-paper hover:border-ink/40"
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="block text-sm font-bold">{title}</span>
        <span className="book-pkg-meta">{meta}</span>
      </span>
      <span className="mt-1 block text-xs text-ink-soft">{blurb}</span>
    </button>
  );
}

export function BookingForm({
  initialSlots,
  initialSuburb = "",
  initialPackage = "good",
}: Props) {
  const router = useRouter();
  const [slots, setSlots] = useState(initialSlots);
  const [step, setStep] = useState<Step>("job");
  const [weekAnchor, setWeekAnchor] = useState<string | null>(null);
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

  const dayMap = useMemo(() => new Map(openDates), [openDates]);

  const weekStart = weekAnchor ?? (openDates[0] ? sundayOf(openDates[0][0]) : "");
  const weekDays = weekStart
    ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    : [];
  const weekEnd = weekStart ? addDays(weekStart, 6) : "";
  const hasPrevWeek = openDates.some(([d]) => d < weekStart);
  const hasNextWeek = openDates.some(([d]) => d > weekEnd);

  const suggestions = useMemo(() => {
    const q = suburbQuery.trim().toLowerCase();
    if (!q) return [];
    return SUBURBS.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 8);
  }, [suburbQuery]);

  useEffect(() => {
    setActiveSug(0);
  }, [suggestions]);

  function pickSuburb(picked: string) {
    setSuburb(picked);
    setSuburbQuery(picked);
    setShowSuggestions(false);
  }

  const price = estimatePrice(packageId, vehicle, frequency);
  const pickedFamily = PACKAGES.find((p) => p.id === packageId)?.family ?? "combined";
  const jobPath =
    pickedFamily === "exterior" ||
    pickedFamily === "interior" ||
    pickedFamily === "maintenance"
      ? pickedFamily
      : "combined";
  const pathPackages =
    jobPath === "combined"
      ? COMBINED_PACKAGES
      : jobPath === "exterior"
        ? EXTERIOR_PACKAGES
        : jobPath === "interior"
          ? INTERIOR_PACKAGES
          : PACKAGES.filter((p) => p.family === "maintenance");
  const selectedDay = date ? dayMap.get(date) : undefined;
  const canOpenDriveway = Boolean(date && slot);

  function go(next: Step) {
    if (next === "driveway" && !canOpenDriveway) {
      setError("Pick a day and morning or afternoon first.");
      setStep("when");
      queueMicrotask(() => scrollSheet("when"));
      return;
    }
    if (next === "when" && openDates.length === 0) {
      setError("No open slots right now — send an inquiry.");
      return;
    }
    setError(null);
    setStep(next);
    queueMicrotask(() => scrollSheet(next));
  }

  function pickPath(id: (typeof JOB_PATHS)[number]["id"]) {
    if (id === "combined") {
      setPackageId("good");
      setFrequency("one-off");
      return;
    }
    if (id === "exterior") {
      setPackageId("exterior-basic");
      setFrequency("one-off");
      return;
    }
    if (id === "interior") {
      setPackageId("interior-basic");
      setFrequency("one-off");
      return;
    }
    setPackageId("maintenance");
    setFrequency("fortnightly");
  }

  useEffect(() => {
    if (!date) return;
    const day = dayMap.get(date);
    if (!day) {
      setDate("");
      setSlot("");
      return;
    }
    if (slot && !day[slot]?.open) setSlot("");
  }, [date, dayMap, slot]);

  async function refreshSlots() {
    const start = new Date().toISOString().slice(0, 10);
    const res = await fetch(`/api/availability?start=${start}&days=42`);
    const data = await res.json();
    setSlots(data.slots);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step !== "driveway") {
      go(step === "job" ? "when" : "driveway");
      return;
    }
    setError(null);
    if (!slot || !date) {
      setError("Pick a date and a morning or afternoon slot.");
      go("when");
      return;
    }
    if (!suburb) {
      setError("Choose a suburb from the list.");
      document.getElementById("suburb")?.focus();
      return;
    }
    if (phone.replace(/\D/g, "").length < 8) {
      setError("Phone needs a real number — at least 8 digits.");
      document.getElementById("phone")?.focus();
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
          You’re booked.
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
            setStep("job");
          }}
        >
          Book another
        </button>
      </div>
    );
  }

  const slotLine = date && slot
    ? `${dayLabel(date)}, ${slot === "am" ? "morning" : "afternoon"}`
    : "Pick a day";

  return (
    <form
      id="book-sheet"
      onSubmit={onSubmit}
      className="book-sheet card noise space-y-6 p-5 md:p-8"
    >
      <p className="book-ticket">
        <span className="book-ticket-copy">
          <b>
            {vehicleLabel(vehicle)} · {packageLabel(packageId)}
          </b>
          <span>{slotLine}</span>
          {suburb ? <span>{suburb}</span> : null}
          <span>Pay on the day</span>
        </span>
        <strong>${price}</strong>
      </p>

      <div className="book-steps" role="navigation" aria-label="Booking steps">
        {STEPS.map((item) => {
          const locked = item.id === "driveway" && !canOpenDriveway && step !== "driveway";
          return (
            <button
              key={item.id}
              type="button"
              aria-current={step === item.id ? "step" : undefined}
              disabled={locked}
              onClick={() => go(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {step === "job" ? (
        <section>
          <h2
            id="book-step-job"
            tabIndex={-1}
            className="font-display text-xl font-semibold"
          >
            What are we washing?
          </h2>
          <p className="book-split-lead">Tap a size, then what’s getting done.</p>
          <fieldset className="mt-4">
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
                  <span className="text-xs text-ink-soft">{SIZE_HINT[v.id]}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="label">The job</legend>
            <div className="book-paths">
              {JOB_PATHS.map((path) => (
                <button
                  key={path.id}
                  type="button"
                  aria-pressed={jobPath === path.id}
                  onClick={() => pickPath(path.id)}
                  className={`choice rounded-2xl border-2 p-3 text-left ${
                    jobPath === path.id
                      ? "border-ink bg-cream"
                      : "border-line bg-paper hover:border-ink/40"
                  }`}
                >
                  <span className="block text-sm font-bold">{path.title}</span>
                  <span className="text-xs text-ink-soft">{path.blurb}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {jobPath === "maintenance" ? (
            <fieldset className="mt-5">
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
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="block text-sm font-bold">{f.label}</span>
                        <span className="book-pkg-meta">
                          ${estimatePrice("maintenance", vehicle, f.id)}
                        </span>
                      </span>
                      <span className="text-xs text-ink-soft">{f.blurb}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <fieldset className="mt-5">
              <legend className="label">Which one</legend>
              <div
                className={`grid gap-2 ${
                  pathPackages.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"
                }`}
              >
                {pathPackages.map((p) => (
                  <PackageButton
                    key={p.id}
                    title={p.label}
                    blurb={p.blurb}
                    meta={`$${estimatePrice(p.id, vehicle)} · ${p.time}`}
                    selected={packageId === p.id}
                    onPick={() => {
                      setPackageId(p.id);
                      setFrequency("one-off");
                    }}
                  />
                ))}
              </div>
            </fieldset>
          )}
        </section>
      ) : null}

      {step === "when" ? (
        <section>
          <h2
            id="book-step-when"
            tabIndex={-1}
            className="font-display text-xl font-semibold"
          >
            When should we come?
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Morning or afternoon, seven days. We come to your driveway.
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
            <>
              <div className="book-week-nav">
                <button
                  type="button"
                  className="book-week-shift"
                  disabled={!hasPrevWeek}
                  onClick={() => setWeekAnchor(addDays(weekStart, -7))}
                >
                  Earlier
                </button>
                <strong>{weekRangeLabel(weekStart)}</strong>
                <button
                  type="button"
                  className="book-week-shift"
                  disabled={!hasNextWeek}
                  onClick={() => setWeekAnchor(addDays(weekStart, 7))}
                >
                  Later
                </button>
              </div>
              <div className="book-week">
                {weekDays.map((d) => {
                  const day = dayMap.get(d);
                  const [y, m, dayNum] = d.split("-").map(Number);
                  const weekday = new Date(Date.UTC(y, m - 1, dayNum)).getUTCDay();
                  const open = Boolean(day?.am?.open || day?.pm?.open);
                  const selected = date === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={!open}
                      aria-pressed={selected}
                      onClick={() => {
                        setDate(d);
                        setSlot("");
                        setError(null);
                      }}
                      className="book-day"
                    >
                      <span className="book-day-name">{WEEKDAYS[weekday]}</span>
                      <span className="book-day-num">{dayNum}</span>
                      <span className="book-day-slots">
                        {open
                          ? [day?.am && "AM", day?.pm && "PM"].filter(Boolean).join(" · ")
                          : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {selectedDay ? (
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
                    onClick={() => {
                      setSlot(s);
                      setError(null);
                    }}
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
          ) : openDates.length > 0 ? (
            <p className="mt-3 text-sm text-ink-soft">Tap a day, then morning or afternoon.</p>
          ) : null}
        </section>
      ) : null}

      {step === "driveway" ? (
        <section className="space-y-3">
          <h2
            id="book-step-driveway"
            tabIndex={-1}
            className="font-display text-xl font-semibold"
          >
            Where’s the driveway?
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Phone is how we find you if the street’s fussy. Pay on the day.
          </p>
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
              <span className="font-normal">(car, colour, dogs, hose tap)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              className="field min-h-24"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="White Camry, hose at the side…"
            />
          </div>
          <FormConsent
            id="book-consent"
            checked={agreed}
            onChange={setAgreed}
          />
        </section>
      ) : null}

      {error && (
        <p
          className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-danger"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      <div className="book-actions">
        {step !== "job" ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => go(step === "driveway" ? "when" : "job")}
          >
            Back
          </button>
        ) : null}
        {step === "job" ? (
          <button type="button" className="btn btn-primary" onClick={() => go("when")}>
            Pick a day
          </button>
        ) : null}
        {step === "when" ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canOpenDriveway}
            onClick={() => go("driveway")}
          >
            Your details
          </button>
        ) : null}
        {step === "driveway" ? (
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Booking…" : "Confirm booking"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
