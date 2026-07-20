import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAndStoreCryptoNews } from "@/lib/cryptoNews";

// Web-search-grounded AI generation can take well past Vercel's default
// function timeout — allow up to 60s (the max on the Hobby plan).
export const maxDuration = 60;

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
    const message = err instanceof Error ? err.message : "Failed to generate crypto news.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
