import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const goals = await prisma.goal.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ goals });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const goal = await prisma.goal.create({
    data: {
      title,
      description: body?.description || null,
      category: body?.category || null,
      progress: Number.isFinite(body?.progress) ? Math.min(100, Math.max(0, body.progress)) : 0,
      targetDate: body?.targetDate ? new Date(body.targetDate) : null,
    },
  });
  return NextResponse.json({ goal }, { status: 201 });
}
