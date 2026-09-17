import { NextResponse } from "next/server";
import { setAdminSession, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.password || !verifyPassword(body.password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
