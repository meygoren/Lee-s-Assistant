import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { StoredSource } from "@/lib/digest";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : null;
  const feedback = body?.feedback === "up" || body?.feedback === "down" ? body.feedback : null;
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  const existing = await prisma.cryptoNewsEntry.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sources = (Array.isArray(existing.sources) ? existing.sources : []) as unknown as StoredSource[];
  const updated = sources.map((s) => (s.url === url ? { ...s, feedback } : s));

  const entry = await prisma.cryptoNewsEntry.update({ where: { id }, data: { sources: updated } });
  return NextResponse.json({ entry });
}
