import { NextResponse } from "next/server";
import { z } from "zod";
import { inquiryFloodError } from "@/lib/abuse";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";
import { notifyInquiry } from "@/lib/notify";
import {
  clientIp,
  digitsIn,
  isTrustedOrigin,
  oneLine,
  readJsonLimited,
  takeRateLimit,
} from "@/lib/security";
import { verifyTurnstile } from "@/lib/turnstile";

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
  website: z.string().max(200).optional(),
  turnstileToken: z.string().max(2048).optional(),
});

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const ip = clientIp(request);
  if (!takeRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many messages. Wait a bit and try again." },
      { status: 429 },
    );
  }

  const body = await readJsonLimited(request, 16 * 1024);
  if (body === undefined) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
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

  const { website, turnstileToken, ...data } = parsed.data;

  // Honeypot tripped: look successful so the bot moves on, but store and send nothing.
  if (website) {
    return NextResponse.json({ id: 0 });
  }
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return NextResponse.json(
      { error: "Couldn’t verify you’re human. Refresh the page and try again." },
      { status: 403 },
    );
  }
  const flood = inquiryFloodError(data.phone);
  if (flood) {
    return NextResponse.json({ error: flood }, { status: 429 });
  }

  const createdAt = new Date().toISOString();
  const clean = {
    name: oneLine(data.name),
    phone: oneLine(data.phone, 30),
    email: data.email?.trim() || null,
    suburb: data.suburb ? oneLine(data.suburb, 80) || null : null,
    message: data.message.trim(),
  };
  const result = db
    .insert(inquiries)
    .values({ ...clean, createdAt, consentedAt: createdAt })
    .run();

  const id = Number(result.lastInsertRowid);
  await notifyInquiry({
    id,
    name: clean.name,
    phone: clean.phone,
    email: clean.email || undefined,
    suburb: clean.suburb || undefined,
    message: clean.message,
  });

  return NextResponse.json({ id });
}
