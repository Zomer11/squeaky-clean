import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/auth";
import { isTrustedOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
