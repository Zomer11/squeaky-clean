import { NextResponse } from "next/server";
import { getAvailabilityForRange, todayISO, toPublicSlots } from "@/lib/booking";
import { clientIp, takeRateLimit } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!takeRateLimit(`avail:${clientIp(request)}`, 120, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Wait a bit and try again." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const rawStart = searchParams.get("start") || "";
  const start = /^\d{4}-\d{2}-\d{2}$/.test(rawStart) ? rawStart : todayISO();
  const days = Math.min(Math.max(1, Number(searchParams.get("days") || 42) || 42), 42);
  const slots = await getAvailabilityForRange(start, days);
  return NextResponse.json({ slots: toPublicSlots(slots) });
}
