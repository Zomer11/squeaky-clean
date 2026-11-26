import { NextResponse } from "next/server";
import { activeSessionCount, isAdminAuthenticated, recentAuthEvents } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    sessions: activeSessionCount(),
    events: recentAuthEvents(15),
  });
}
