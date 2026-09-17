import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { getCapacities, setCapacities } from "@/lib/booking";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const caps = await getCapacities();
  return NextResponse.json(caps);
}

const schema = z.object({
  am: z.number().int().min(1).max(40),
  pm: z.number().int().min(1).max(40),
});

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid capacity" }, { status: 400 });
  }
  await setCapacities(parsed.data.am, parsed.data.pm);
  return NextResponse.json({ ok: true });
}
