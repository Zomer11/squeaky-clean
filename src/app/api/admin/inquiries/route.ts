import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { listRecentInquiries } from "@/lib/booking";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await listRecentInquiries();
  return NextResponse.json({ inquiries: rows });
}
