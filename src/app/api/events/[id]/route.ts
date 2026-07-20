import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.description === "string" || body.description === null) data.description = body.description;
  if (typeof body.date === "string") data.date = new Date(body.date);
  if (typeof body.allDay === "boolean") data.allDay = body.allDay;
  if (typeof body.important === "boolean") data.important = body.important;

  const event = await prisma.calendarEvent.update({ where: { id }, data });
  return NextResponse.json({ event });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.calendarEvent.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
