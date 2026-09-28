import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";
import { notifyInquiry } from "@/lib/notify";
import { clientIp, digitsIn, isTrustedOrigin, takeRateLimit } from "@/lib/security";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1).max(120),
  phone: z
    .string()
    .min(8)
    .max(30)
    .refine((value) => digitsIn(value) >= 8),
  email: z.string().email().optional().or(z.literal("")),
  suburb: z.string().max(80).optional(),
  message: z.string().min(5).max(2000),
  consent: z.literal(true),
});

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (!takeRateLimit(`contact:${clientIp(request)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many messages. Wait a bit and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const consentFail = parsed.error.issues.some((i) => i.path[0] === "consent");
    return NextResponse.json(
      {
        error: consentFail
          ? "Tick the box to agree to the privacy policy and terms."
          : "Check the form — something’s missing.",
      },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const createdAt = new Date().toISOString();
  const result = db
    .insert(inquiries)
    .values({
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      suburb: data.suburb?.trim() || null,
      message: data.message.trim(),
      createdAt,
      consentedAt: createdAt,
    })
    .run();

  const id = Number(result.lastInsertRowid);
  await notifyInquiry({
    id,
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || undefined,
    suburb: data.suburb?.trim() || undefined,
    message: data.message.trim(),
  });

  return NextResponse.json({ id });
}
