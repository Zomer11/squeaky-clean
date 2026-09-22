import { NextResponse } from "next/server";
import { z } from "zod";
import { createBooking } from "@/lib/booking";
import { PACKAGE_IDS, SIZE_IDS } from "@/lib/constants";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(8).max(30),
  email: z.string().email().optional().or(z.literal("")),
  suburb: z.string().min(1).max(80),
  address: z.string().min(3).max(200),
  vehicle: z.enum(SIZE_IDS),
  packageId: z.enum(PACKAGE_IDS),
  frequency: z.enum(["one-off", "weekly", "fortnightly", "monthly"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.enum(["am", "pm"]),
  notes: z.string().max(500).optional(),
});

function schemaErrorMessage(error: z.ZodError): string {
  const key = error.issues[0]?.path[0];
  switch (key) {
    case "name":
      return "Name is required.";
    case "phone":
      return "Phone needs a real number — at least 8 digits.";
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
    default:
      return "Check the form — something’s missing or invalid.";
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: schemaErrorMessage(parsed.error) },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const result = await createBooking({
    ...data,
    email: data.email || undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ id: result.id });
}
