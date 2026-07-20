import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAIText, getActiveProvider } from "@/lib/ai";
import { pushToTelegram } from "@/lib/telegram";

const TELEGRAM_SEND_MARKER = /\[\[SEND_TELEGRAM:\s*([\s\S]*?)\]\]/;

const STUB_REPLY = {
  zh: "我还没有连接到 AI 大脑（尚未配置 API Key）。请到设置页面添加 Anthropic 或 Gemini 密钥，之后我就能真正回答你的问题、总结你的目标和日程了。",
  en: "I'm not connected to an AI brain yet (no API key configured). Add an Anthropic or Gemini key in Settings and I'll be able to actually answer questions and summarize your goals and schedule.",
};

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const lang: "zh" | "en" = body?.lang === "en" ? "en" : "zh";

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (!getActiveProvider()) {
    return NextResponse.json({ reply: STUB_REPLY[lang] });
  }

  const [settings, goals, events] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "singleton" } }),
    prisma.goal.findMany({ where: { status: "active" }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.calendarEvent.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 10,
    }),
  ]);

  const goalsSummary = goals
    .map((g) => `- ${g.title} (${g.progress}%)${g.targetDate ? `, due ${g.targetDate.toISOString().slice(0, 10)}` : ""}`)
    .join("\n") || "(none)";
  const eventsSummary = events
    .map((e) => `- ${e.title} on ${e.date.toISOString().slice(0, 10)}${e.important ? " [important]" : ""}`)
    .join("\n") || "(none)";

  const languageInstruction = lang === "zh" ? "Respond in Mandarin Chinese." : "Respond in English.";

  const telegramReady = Boolean(settings?.telegramChatId && process.env.TELEGRAM_BOT_TOKEN);

  const systemPrompt = `You are Lee's personal AI assistant inside his personal dashboard app. Lee is a beginner when it comes to AI — explain things clearly, simply, and without unnecessary jargon. When something is technical, briefly explain what it means. Ask a clarifying question when it genuinely helps you tailor your answer, but don't pepper him with questions when a direct answer will do.

${languageInstruction}

Lee's current active goals:
${goalsSummary}

Lee's upcoming calendar events:
${eventsSummary}

Known settings: AI knowledge level notes = "${settings?.aiKnowledgeLevel ?? "beginner"}".

Telegram: ${telegramReady ? "connected and ready to send messages" : "not connected — do not claim you sent or will send anything to Telegram"}.
If Lee asks you to send something to his Telegram and Telegram is connected, and you have clear text to send (either he gave it to you, or you can write it yourself, e.g. a summary he asked for), put the exact text on its own line as [[SEND_TELEGRAM: the message text]] — this line is invisible to Lee and triggers a real send, so also write a normal short reply confirming what you're sending. If Telegram isn't connected, or you don't yet know what to send, say so / ask instead of using the marker.

Keep replies conversational and concise (a few sentences, unless Lee is asking for a detailed summary of everything, in which case you may use short bullet points).`;

  try {
    const rawReply = (await generateAIText({ systemPrompt, userMessage: message, maxTokens: 800 })) || STUB_REPLY[lang];

    let reply = rawReply;
    const telegramMatch = rawReply.match(TELEGRAM_SEND_MARKER);
    if (telegramMatch) {
      reply = rawReply.replace(TELEGRAM_SEND_MARKER, "").trim();
      if (telegramReady && settings?.telegramChatId) {
        const sent = await pushToTelegram(settings.telegramChatId, telegramMatch[1].trim());
        if (!sent) {
          reply += lang === "zh" ? "\n\n（不过发送到 Telegram 时出了点问题，请稍后再试一次。）" : "\n\n(Though something went wrong sending that to Telegram — please try again shortly.)";
        }
      }
    }

    await prisma.chatMessage.createMany({
      data: [
        { role: "user", content: message },
        { role: "assistant", content: reply },
      ],
    });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Assistant chat error:", err);
    return NextResponse.json(
      { reply: lang === "zh" ? "抱歉，请求 AI 时出现问题，请稍后再试。" : "Sorry, something went wrong reaching the AI. Please try again shortly." },
      { status: 200 }
    );
  }
}
