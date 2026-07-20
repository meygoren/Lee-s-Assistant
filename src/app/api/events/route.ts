import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // "YYYY-MM"

  const where: Record<string, unknown> = {};
  if (month) {
    const [y, m] = month.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);
    where.date = { gte: start, lt: end };
  }

  const events = await prisma.calendarEvent.findMany({ where, orderBy: { date: "asc" } });
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const date = typeof body?.date === "string" ? body.date : "";
  if (!title || !date) {
    return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
  }

  const event = await prisma.calendarEvent.create({
    data: {
      title,
      description: body?.description || null,
      date: new Date(date),
      allDay: body?.allDay !== false,
      important: Boolean(body?.important),
    },
  });
  return NextResponse.json({ event }, { status: 201 });
}
