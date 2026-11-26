import { NextResponse } from "next/server";
import { z } from "zod";
import { createBooking } from "@/lib/booking";
import { estimatePrice, PACKAGE_IDS, SIZE_IDS } from "@/lib/constants";
import { notifyBooking } from "@/lib/notify";
import { parseAuMobile } from "@/lib/phone";
import { bookingFloodError } from "@/lib/abuse";
import { clientIp, isTrustedOrigin, readJsonLimited, takeRateLimit } from "@/lib/security";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1).max(120),
  phone: z
    .string()
    .min(8)
    .max(30)
    .refine((value) => Boolean(parseAuMobile(value))),
  email: z.string().email().optional().or(z.literal("")),
  suburb: z.string().min(1).max(80),
  address: z.string().min(3).max(200),
  vehicle: z.enum(SIZE_IDS),
  packageId: z.enum(PACKAGE_IDS),
  frequency: z.enum(["one-off", "weekly", "fortnightly", "monthly"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.enum(["am", "pm"]),
  notes: z.string().max(500).optional(),
  consent: z.literal(true),
  website: z.string().max(200).optional(),
  turnstileToken: z.string().max(2048).optional(),
});

function schemaErrorMessage(error: z.ZodError): string {
  const key = error.issues[0]?.path[0];
  switch (key) {
    case "name":
      return "Name is required.";
    case "phone":
      return "Need an Australian mobile — we text the confirmation.";
    case "email":
      return "That email doesn’t look right. Leave it blank if you don’t have one.";
    case "suburb":
      return "Choose a suburb from the list.";
    case "address":
      return "Street address is too short.";
    case "vehicle":
      return "Pick a vehicle size.";
    case "packageId":
      return "Pick a package.";
    case "frequency":
      return "Pick how often.";
    case "date":
      return "Pick a date.";
    case "slot":
      return "Pick morning or afternoon.";
    case "notes":
      return "Notes are too long. Keep it under 500 characters.";
    case "consent":
      return "Tick the box to agree to the privacy policy and terms.";
    default:
      return "Check the form — something’s missing or invalid.";
  }
}

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const ip = clientIp(request);
  if (!takeRateLimit(`book:${ip}`, 8, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many booking attempts. Wait a bit and try again." },
      { status: 429 },
    );
  }

  const body = await readJsonLimited(request, 8 * 1024);
  if (body === undefined) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: schemaErrorMessage(parsed.error) },
      { status: 400 },
    );
  }

  const { website, turnstileToken, ...data } = parsed.data;

  // Honeypot tripped: look successful so the bot moves on, but store and send nothing.
  if (website) {
    return NextResponse.json({ id: 0, smsSent: false, emailSent: false });
  }
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return NextResponse.json(
      { error: "Couldn’t verify you’re human. Refresh the page and try again." },
      { status: 403 },
    );
  }
  const flood = bookingFloodError(parseAuMobile(data.phone)!);
  if (flood) {
    return NextResponse.json({ error: flood }, { status: 429 });
  }

  const result = await createBooking({
    ...data,
    email: data.email || undefined,
    consentedAt: new Date().toISOString(),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const mobile = parseAuMobile(data.phone)!;
  const notified = await notifyBooking({
    id: result.id,
    name: data.name,
    phone: mobile,
    email: data.email || undefined,
    suburb: data.suburb,
    address: data.address,
    vehicle: data.vehicle,
    packageId: data.packageId,
    frequency: data.frequency,
    date: data.date,
    slot: data.slot,
    notes: data.notes,
    price: estimatePrice(data.packageId, data.vehicle, data.frequency),
  });

  return NextResponse.json({
    id: result.id,
    smsSent: notified.sms,
    emailSent: notified.email,
  });
}
