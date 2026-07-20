import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.feedback === null || ["more", "less", "known"].includes(body.feedback)) {
    data.feedback = body.feedback;
  }
  if (typeof body.feedbackNote === "string" || body.feedbackNote === null) {
    data.feedbackNote = body.feedbackNote || null;
  }

  const entry = await prisma.cryptoNewsEntry.update({ where: { id }, data });
  return NextResponse.json({ entry });
}
