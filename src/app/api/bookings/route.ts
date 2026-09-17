import { NextResponse } from "next/server";
import { z } from "zod";
import { createBooking } from "@/lib/booking";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(8).max(30),
  email: z.string().email().optional().or(z.literal("")),
  suburb: z.string().min(1).max(80),
  address: z.string().min(3).max(200),
  vehicle: z.enum(["hatch", "sedan", "suv", "ute"]),
  packageId: z.enum(["exterior", "interior", "full"]),
  frequency: z.enum(["one-off", "fortnightly", "monthly"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.enum(["am", "pm"]),
  notes: z.string().max(500).optional(),
});

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
      { error: "Check the form — something’s missing or invalid." },
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
