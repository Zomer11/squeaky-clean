import { NextResponse } from "next/server";
import { z } from "zod";
import {
  adminConfigProblem,
  adminIpAllowed,
  createAdminSession,
  loginLockout,
  recordAuthEvent,
  verifyCredentials,
} from "@/lib/auth";
import { notifySecurity } from "@/lib/notify";
import { clientIp, isTrustedOrigin, readJsonLimited } from "@/lib/security";

export const runtime = "nodejs";

const bodySchema = z.object({
  password: z.string().min(1).max(256),
  code: z.string().max(12).optional().default(""),
});

const GENERIC_FAIL = "Wrong password or code.";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const started = Date.now();
  const ip = clientIp(request);
  const ua = request.headers.get("user-agent")?.slice(0, 160) ?? "unknown";

  if (!adminIpAllowed(ip)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!isTrustedOrigin(request)) {
    await recordAuthEvent("forbidden_origin", ip);
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const lockout = loginLockout(ip);
  if (lockout) {
    await recordAuthEvent("rate_limited", ip);
    return NextResponse.json(
      {
        error:
          lockout === "ip"
            ? "Too many attempts from this network. Wait 15 minutes."
            : "Sign-in is paused after too many failed attempts. Try again within the hour.",
      },
      { status: 429 },
    );
  }

  const problem = adminConfigProblem();
  if (problem) {
    await recordAuthEvent("not_configured", ip);
    console.error(`[admin] ${problem}`);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "Admin sign-in is unavailable."
            : problem,
      },
      { status: 503 },
    );
  }

  const result = bodySchema.safeParse(await readJsonLimited(request, 2 * 1024));
  if (!result.success) {
    return NextResponse.json({ error: GENERIC_FAIL }, { status: 400 });
  }
  const parsed = result.data;

  const ok = await verifyCredentials(parsed.password, parsed.code);

  // Even out response time so success and failure look the same from outside.
  const floor = 600 + Math.floor(Math.random() * 300);
  const elapsed = Date.now() - started;
  if (elapsed < floor) await sleep(floor - elapsed);

  if (!ok) {
    await recordAuthEvent("login_failed", ip);
    if (loginLockout(ip)) {
      await recordAuthEvent("locked_out", ip);
      void notifySecurity("Admin sign-in locked", [
        "Repeated failed admin sign-ins tripped the lockout.",
        `IP: ${ip}`,
        `Browser: ${ua}`,
        `At: ${new Date().toISOString()}`,
        "",
        "If this wasn't you, nothing to do — the lock clears on its own.",
        "If it keeps happening, rotate the password with `npm run admin:setup`.",
      ]);
    }
    return NextResponse.json({ error: GENERIC_FAIL }, { status: 401 });
  }

  await createAdminSession(ip);
  await recordAuthEvent("login_ok", ip);
  void notifySecurity("New admin sign-in", [
    "Someone just signed in to the ops desk.",
    `IP: ${ip}`,
    `Browser: ${ua}`,
    `At: ${new Date().toISOString()}`,
    "",
    "Not you? Sign in, hit “Sign out everywhere”, and rotate the password with `npm run admin:setup`.",
  ]);
  return NextResponse.json({ ok: true });
}
