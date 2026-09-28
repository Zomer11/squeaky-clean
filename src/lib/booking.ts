import "server-only";

import { and, count, desc, eq, gte, ne } from "drizzle-orm";
import { db, sqlite } from "./db";
import { parseAuMobile } from "./phone";
import { blockedDates, bookings, inquiries, settings } from "./db/schema";
import {
  MAINTENANCE_FREQUENCIES,
  PACKAGE_IDS,
  SIZE_IDS,
  isMaintenance,
  type Frequency,
  type PackageId,
  type Slot,
  type VehicleId,
} from "./constants";
import { isServiceSuburb } from "./suburbs";

export type SlotAvailability = {
  date: string;
  slot: Slot;
  capacity: number;
  booked: number;
  remaining: number;
  open: boolean;
};

/** Public calendar payload — no occupancy counts (avoids volume leakage). */
export type PublicSlot = {
  date: string;
  slot: Slot;
  open: boolean;
};

const BRISBANE = "Australia/Brisbane";

/** Calendar day in Brisbane business timezone (not the host's local TZ). */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BRISBANE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function toPublicSlots(slots: SlotAvailability[]): PublicSlot[] {
  return slots.map(({ date, slot, open }) => ({ date, slot, open }));
}

export function isBookableWeekday(_dateStr: string): boolean {
  // Runs every day including Sunday
  return true;
}

export async function getCapacities(): Promise<{ am: number; pm: number }> {
  const rows = db.select().from(settings).all();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    am: Number(map.capacity_am ?? 8) || 8,
    pm: Number(map.capacity_pm ?? 8) || 8,
  };
}

export async function setCapacities(am: number, pm: number): Promise<void> {
  db.insert(settings)
    .values({ key: "capacity_am", value: String(am) })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: String(am) },
    })
    .run();
  db.insert(settings)
    .values({ key: "capacity_pm", value: String(pm) })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: String(pm) },
    })
    .run();
}

export async function getBlockedSet(): Promise<Set<string>> {
  const rows = db.select().from(blockedDates).all();
  return new Set(rows.map((r) => r.date));
}

export async function listBlockedDates() {
  return db.select().from(blockedDates).all().sort((a, b) => a.date.localeCompare(b.date));
}

function bookedCount(date: string, slot: Slot): number {
  const row = db
    .select({ n: count() })
    .from(bookings)
    .where(
      and(
        eq(bookings.date, date),
        eq(bookings.slot, slot),
        eq(bookings.status, "confirmed"),
      ),
    )
    .get();
  return row?.n ?? 0;
}

export async function getAvailabilityForRange(
  startDate: string,
  days: number,
): Promise<SlotAvailability[]> {
  const caps = await getCapacities();
  const blocked = await getBlockedSet();
  const out: SlotAvailability[] = [];
  const [y, m, d] = startDate.split("-").map(Number);
  const cursor = new Date(y, m - 1, d);

  for (let i = 0; i < days; i++) {
    const yy = cursor.getFullYear();
    const mm = String(cursor.getMonth() + 1).padStart(2, "0");
    const dd = String(cursor.getDate()).padStart(2, "0");
    const date = `${yy}-${mm}-${dd}`;
    const weekdayOk = isBookableWeekday(date);
    const isBlocked = blocked.has(date);

    for (const slot of ["am", "pm"] as Slot[]) {
      const capacity = slot === "am" ? caps.am : caps.pm;
      const booked = bookedCount(date, slot);
      const remaining = Math.max(0, capacity - booked);
      const open =
        weekdayOk && !isBlocked && remaining > 0 && date >= todayISO();
      out.push({ date, slot, capacity, booked, remaining, open });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export async function getNextAvailable(): Promise<SlotAvailability | null> {
  const list = await getAvailabilityForRange(todayISO(), 42);
  return list.find((s) => s.open) ?? null;
}

export type CreateBookingInput = {
  name: string;
  phone: string;
  email?: string;
  suburb: string;
  address: string;
  vehicle: VehicleId;
  packageId: PackageId;
  frequency: Frequency;
  date: string;
  slot: Slot;
  notes?: string;
  /** ISO timestamp when the customer agreed to privacy/terms. */
  consentedAt: string;
};

export type BookingResult =
  | { ok: true; id: number }
  | { ok: false; error: string };

export async function createBooking(
  input: CreateBookingInput,
): Promise<BookingResult> {
  const name = input.name.trim();
  const phone = parseAuMobile(input.phone);
  const suburb = input.suburb.trim();
  const address = input.address.trim();

  if (!name || !suburb || !address) {
    return { ok: false, error: "Name, phone, suburb and address are required." };
  }
  if (!phone) {
    return {
      ok: false,
      error: "Need an Australian mobile — we text the confirmation.",
    };
  }
  if ((input.notes?.trim().length ?? 0) > 500) {
    return { ok: false, error: "Notes are too long. Keep it under 500 characters." };
  }
  if (!(SIZE_IDS as readonly string[]).includes(input.vehicle)) {
    return { ok: false, error: "Pick a vehicle size." };
  }
  if (!(PACKAGE_IDS as readonly string[]).includes(input.packageId)) {
    return { ok: false, error: "Pick a detail package." };
  }
  if (isMaintenance(input.packageId)) {
    if (!(MAINTENANCE_FREQUENCIES as readonly string[]).includes(input.frequency)) {
      return {
        ok: false,
        error: "Pick weekly, fortnightly or monthly for the maintenance plan.",
      };
    }
  } else if (input.frequency !== "one-off") {
    return {
      ok: false,
      error: "That package is a one-off. Use the maintenance plan for a standing slot.",
    };
  }
  if (!["am", "pm"].includes(input.slot)) {
    return { ok: false, error: "Invalid slot." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { ok: false, error: "Invalid date." };
  }
  if (!isServiceSuburb(suburb)) {
    return {
      ok: false,
      error:
        "That suburb isn’t on our regular run. Use the contact form and we’ll check.",
    };
  }
  if (input.date < todayISO()) {
    return { ok: false, error: "That date has already passed." };
  }
  if (!isBookableWeekday(input.date)) {
    return { ok: false, error: "That date isn’t available." };
  }

  const blocked = await getBlockedSet();
  if (blocked.has(input.date)) {
    return { ok: false, error: "That day is fully blocked. Pick another date." };
  }

  const caps = await getCapacities();
  const capacity = input.slot === "am" ? caps.am : caps.pm;
  const createdAt = new Date().toISOString();

  try {
    const commit = sqlite.transaction(() => {
      if (bookedCount(input.date, input.slot) >= capacity) {
        return { ok: false as const, error: "That slot just filled up. Pick another." };
      }
      const result = db
        .insert(bookings)
        .values({
          name,
          phone,
          email: input.email?.trim() || null,
          suburb,
          address,
          binTypes: JSON.stringify([input.packageId]),
          vehicle: input.vehicle,
          frequency: input.frequency,
          date: input.date,
          slot: input.slot,
          notes: input.notes?.trim() || null,
          status: "confirmed",
          createdAt,
          consentedAt: input.consentedAt,
        })
        .run();
      return { ok: true as const, id: Number(result.lastInsertRowid) };
    });
    return commit();
  } catch {
    return { ok: false, error: "Couldn’t save that booking. Try again." };
  }
}

export async function listUpcomingBookings() {
  const today = todayISO();
  return db
    .select()
    .from(bookings)
    .where(and(gte(bookings.date, today), ne(bookings.status, "cancelled")))
    .all()
    .sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return a.slot.localeCompare(b.slot);
    });
}

export async function listAllRecentBookings(limit = 100) {
  return db
    .select()
    .from(bookings)
    .orderBy(desc(bookings.createdAt))
    .limit(limit)
    .all();
}

export async function listRecentInquiries(limit = 100) {
  return db
    .select()
    .from(inquiries)
    .orderBy(desc(inquiries.createdAt))
    .limit(limit)
    .all();
}

export async function cancelBooking(id: number): Promise<boolean> {
  const result = db
    .update(bookings)
    .set({ status: "cancelled" })
    .where(eq(bookings.id, id))
    .run();
  return result.changes > 0;
}

export async function blockDate(date: string, reason?: string) {
  db.insert(blockedDates)
    .values({ date, reason: reason || null })
    .onConflictDoNothing()
    .run();
}

export async function unblockDate(date: string) {
  db.delete(blockedDates).where(eq(blockedDates.date, date)).run();
}

export function formatSlotLabel(slot: Slot): string {
  return slot === "am" ? "Morning" : "Afternoon";
}

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

export function formatDateLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS[weekday]}, ${d} ${MONTHS[m - 1]} ${y}`;
}
