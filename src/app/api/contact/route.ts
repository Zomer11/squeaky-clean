import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(8).max(30),
  email: z.string().email().optional().or(z.literal("")),
  suburb: z.string().max(80).optional(),
  message: z.string().min(5).max(2000),
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
      { error: "Check the form — something’s missing." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const result = db
    .insert(inquiries)
    .values({
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      suburb: data.suburb?.trim() || null,
      message: data.message.trim(),
      createdAt: new Date().toISOString(),
    })
    .run();

  return NextResponse.json({ id: Number(result.lastInsertRowid) });
}
