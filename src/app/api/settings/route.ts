import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    },
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.language === "zh" || body.language === "en") data.language = body.language;
  if (typeof body.aiKnowledgeLevel === "string") data.aiKnowledgeLevel = body.aiKnowledgeLevel;
  if (typeof body.wechatWebhookUrl === "string" || body.wechatWebhookUrl === null) {
    data.wechatWebhookUrl = body.wechatWebhookUrl || null;
  }

  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  return NextResponse.json({ settings });
}
