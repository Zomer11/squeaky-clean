import { NextResponse } from "next/server";
import { adminConfigured, setAdminSession, verifyPassword } from "@/lib/auth";
import { clientIp, isTrustedOrigin, takeRateLimit } from "@/lib/security";

export const runtime = "nodejs";

function audit(event: string, fields: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      type: "admin.auth",
      event,
      at: new Date().toISOString(),
      ...fields,
    }),
  );
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  if (!isTrustedOrigin(request)) {
    audit("forbidden_origin", { ip });
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (!takeRateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
    audit("rate_limited", { ip });
    return NextResponse.json(
      { error: "Too many login attempts. Wait 15 minutes." },
      { status: 429 },
    );
  }
  if (!adminConfigured()) {
    audit("not_configured", { ip });
    return NextResponse.json(
      {
        error:
          "Admin is not configured. Set a long unique password and a separate signing secret (32+ chars) in the server environment.",
      },
      { status: 503 },
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.password || !verifyPassword(body.password)) {
    audit("login_failed", { ip });
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  await setAdminSession();
  audit("login_ok", { ip });
  return NextResponse.json({ ok: true });
}
