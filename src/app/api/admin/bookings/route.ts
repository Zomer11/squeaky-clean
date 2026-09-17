import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { listAllRecentBookings } from "@/lib/booking";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await listAllRecentBookings();
  return NextResponse.json({ bookings: rows });
}
