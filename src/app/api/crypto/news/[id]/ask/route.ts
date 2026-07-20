import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAIText, getActiveProvider } from "@/lib/ai";
import type { FollowUp } from "@/lib/digest";

// Answering can involve a real AI call, though no web search — keep headroom
// above Vercel's default timeout just in case.
export const maxDuration = 30;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question) return NextResponse.json({ error: "question is required" }, { status: 400 });

  const [entry, settings] = await Promise.all([
    prisma.cryptoNewsEntry.findUnique({ where: { id } }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!getActiveProvider()) return NextResponse.json({ error: "No AI provider configured" }, { status: 400 });

  const lang: "zh" | "en" = settings?.language === "en" ? "en" : "zh";
  const languageInstruction = lang === "zh" ? "Respond in Mandarin Chinese." : "Respond in English.";

  const existingFollowUps = (Array.isArray(entry.followUps) ? entry.followUps : []) as unknown as FollowUp[];
  const priorQA = existingFollowUps.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");

  const systemPrompt = `Lee is asking a follow-up question about this crypto news digest he just read. Answer clearly and simply — he's not a technical/professional trader. Keep it focused and concise (a few sentences, more only if genuinely needed). Don't give direct financial/investment advice — explain what's happening and why it matters, and let him draw his own conclusions.

${languageInstruction}

The digest:
"""
${entry.content}
"""
${priorQA ? `\nPrior follow-up questions on this digest:\n${priorQA}\n` : ""}`;

  const { text } = await generateAIText({ systemPrompt, userMessage: question, maxTokens: 600 });
  const answer =
    text ||
    (lang === "zh" ? "抱歉，回答时出现问题，请稍后再试。" : "Sorry, something went wrong answering that — please try again.");

  const followUps = [...existingFollowUps, { question, answer, createdAt: new Date().toISOString() }];
  const updated = await prisma.cryptoNewsEntry.update({ where: { id }, data: { followUps } });

  return NextResponse.json({ entry: updated });
}
