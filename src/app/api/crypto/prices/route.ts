import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCoinPrices, DEFAULT_CRYPTO_COINS } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids");

  let coinIds: string[];
  if (idsParam) {
    coinIds = idsParam.split(",").filter(Boolean);
  } else {
    const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
    const stored = settings?.cryptoCoins;
    coinIds = Array.isArray(stored) && stored.length > 0 ? (stored as string[]) : DEFAULT_CRYPTO_COINS;
  }

  try {
    const prices = await fetchCoinPrices(coinIds);
    return NextResponse.json({ prices });
  } catch (err) {
    console.error("Crypto price fetch failed:", err);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 502 });
  }
}
