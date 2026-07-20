import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.description === "string" || body.description === null) data.description = body.description;
  if (typeof body.category === "string" || body.category === null) data.category = body.category;
  if (Number.isFinite(body.progress)) data.progress = Math.min(100, Math.max(0, body.progress));
  if (typeof body.status === "string") data.status = body.status;
  if (body.targetDate === null) data.targetDate = null;
  else if (typeof body.targetDate === "string") data.targetDate = new Date(body.targetDate);

  const goal = await prisma.goal.update({ where: { id }, data });
  return NextResponse.json({ goal });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
