import { NextResponse } from "next/server";
import {
  clearAdminSession,
  clearAllAdminSessions,
  isAdminAuthenticated,
  recordAuthEvent,
} from "@/lib/auth";
import { clientIp, isTrustedOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const ip = clientIp(request);
  const everywhere = new URL(request.url).searchParams.get("everywhere") === "1";

  if (everywhere) {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await clearAllAdminSessions();
    await recordAuthEvent("logout_all", ip);
    return NextResponse.json({ ok: true });
  }

  await clearAdminSession();
  await recordAuthEvent("logout", ip);
  return NextResponse.json({ ok: true });
}
