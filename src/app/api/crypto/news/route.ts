import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAndStoreCryptoNews } from "@/lib/cryptoNews";

export async function GET() {
  const entries = await prisma.cryptoNewsEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ entries });
}

export async function POST() {
  try {
    const entry = await generateAndStoreCryptoNews();
    return NextResponse.json({ entry });
  } catch (err) {
    console.error("Crypto news generation error:", err);
    return NextResponse.json({ error: "Failed to generate crypto news." }, { status: 500 });
  }
}
