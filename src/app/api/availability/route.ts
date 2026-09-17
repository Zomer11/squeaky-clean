import { NextResponse } from "next/server";
import { getAvailabilityForRange } from "@/lib/booking";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start =
    searchParams.get("start") ||
    new Date().toISOString().slice(0, 10);
  const days = Math.min(Number(searchParams.get("days") || 42), 90);
  const slots = await getAvailabilityForRange(start, days);
  return NextResponse.json({ slots });
}
