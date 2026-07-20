import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MAX_TRACKED_COINS } from "@/lib/crypto";
import { getActiveProvider } from "@/lib/ai";

export async function GET() {
  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return NextResponse.json({
    settings: {
      ...settings,
      anthropicKeyConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
      geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
      activeAIProvider: getActiveProvider(),
      telegramBotTokenConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    },
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.language === "zh" || body.language === "en") data.language = body.language;
  if (typeof body.aiKnowledgeLevel === "string") data.aiKnowledgeLevel = body.aiKnowledgeLevel;
  if (typeof body.cryptoKnowledgeLevel === "string") data.cryptoKnowledgeLevel = body.cryptoKnowledgeLevel;
  if (typeof body.wechatWebhookUrl === "string" || body.wechatWebhookUrl === null) {
    data.wechatWebhookUrl = body.wechatWebhookUrl || null;
  }
  if (typeof body.telegramChatId === "string" || body.telegramChatId === null) {
    data.telegramChatId = body.telegramChatId || null;
  }
  if (Array.isArray(body.globeTimeZones) && body.globeTimeZones.every((v: unknown) => typeof v === "string")) {
    data.globeTimeZones = body.globeTimeZones;
  }
  if (Array.isArray(body.cryptoCoins) && body.cryptoCoins.every((v: unknown) => typeof v === "string")) {
    data.cryptoCoins = body.cryptoCoins.slice(0, MAX_TRACKED_COINS);
  }

  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  return NextResponse.json({ settings });
}
