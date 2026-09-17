import "server-only";

import { and, count, eq, gte, ne } from "drizzle-orm";
import { db } from "./db";
import { blockedDates, bookings, settings } from "./db/schema";
import type { Frequency, PackageId, Slot, VehicleId } from "./constants";
import { isServiceSuburb } from "./suburbs";

export type SlotAvailability = {
  date: string;
  slot: Slot;
  capacity: number;
  booked: number;
  remaining: number;
  open: boolean;
};

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
};

export type BookingResult =
  | { ok: true; id: number }
  | { ok: false; error: string };

export async function createBooking(
  input: CreateBookingInput,
): Promise<BookingResult> {
  const name = input.name.trim();
  const phone = input.phone.trim();
  const suburb = input.suburb.trim();
  const address = input.address.trim();

  if (!name || !phone || !suburb || !address) {
    return { ok: false, error: "Name, phone, suburb and address are required." };
  }
  if (!["hatch", "sedan", "suv", "ute"].includes(input.vehicle)) {
    return { ok: false, error: "Pick a vehicle type." };
  }
  if (!["exterior", "interior", "full"].includes(input.packageId)) {
    return { ok: false, error: "Pick a detail package." };
  }
  if (!["one-off", "fortnightly", "monthly"].includes(input.frequency)) {
    return { ok: false, error: "Invalid frequency." };
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
  const booked = bookedCount(input.date, input.slot);
  if (booked >= capacity) {
    return { ok: false, error: "That slot just filled up. Pick another." };
  }

  const createdAt = new Date().toISOString();
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
    })
    .run();

  return { ok: true, id: Number(result.lastInsertRowid) };
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
    .all()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
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
