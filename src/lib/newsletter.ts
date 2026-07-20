import { prisma } from "@/lib/prisma";
import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/anthropic";
import { pushToWeChat } from "@/lib/wechat";
import type { NewsletterEntry } from "@/generated/prisma";

const STUB_CONTENT: Record<"zh" | "en", { summary: string; content: string; askBack: string }> = {
  zh: {
    summary: "示例内容：尚未配置 Anthropic API Key。",
    content:
      "这是一个示例 AI 快讯。配置好 Anthropic API Key 后，这里将会是每天为你搜索并整理的最新 AI 工具和新闻，并说明如何用在你的生活和工作中。",
    askBack: "你目前最常用哪些 AI 工具？",
  },
  en: {
    summary: "Sample content: Anthropic API key not configured yet.",
    content:
      "This is placeholder content. Once you add an Anthropic API key, this tab will show a daily digest of the newest AI tools and news, explained simply and tied to your life and work.",
    askBack: "Which AI tools do you currently use most often?",
  },
};

function splitAskBack(text: string): { content: string; askBack: string | null } {
  const marker = "QUESTION:";
  const idx = text.lastIndexOf(marker);
  if (idx === -1) return { content: text.trim(), askBack: null };
  return {
    content: text.slice(0, idx).trim(),
    askBack: text.slice(idx + marker.length).trim(),
  };
}

export async function generateAndStoreNewsletter(): Promise<NewsletterEntry> {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  const lang: "zh" | "en" = settings?.language === "en" ? "en" : "zh";

  const client = getAnthropicClient();
  if (!client) {
    const stub = STUB_CONTENT[lang];
    return prisma.newsletterEntry.create({
      data: { summary: stub.summary, content: stub.content, askBack: stub.askBack },
    });
  }

  const languageInstruction =
    lang === "zh" ? "Write your response in Mandarin Chinese." : "Write your response in English.";

  const systemPrompt = `You are curating a daily AI digest for Lee, a beginner when it comes to AI. Search the web for genuinely new AI developments from the last 1-2 days: new model releases, new AI features in tools he might use, new MCP plugins, or other notable AI news.

For each item: explain it in plain, simple language (avoid jargon, or briefly define it when unavoidable), then explain concretely how Lee could use it in his life or work.

What we know about Lee so far (may be sparse — treat gaps as an opportunity to learn more, not as blockers): "${settings?.aiKnowledgeLevel ?? "beginner, no other details yet"}".

${languageInstruction}

Format as Markdown with 2-4 short items, each with a bold title. Keep the whole digest readable in under two minutes.

End your response with exactly one clarifying question to help you understand Lee's work/life/interests better for future digests, on its own line prefixed by "QUESTION:" (in ${lang === "zh" ? "Mandarin" : "English"}).`;

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2000,
    system: systemPrompt,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
    messages: [
      {
        role: "user",
        content: "Search for today's genuinely new AI news and tools, then write my digest.",
      },
    ],
  });

  const fullText = response.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("\n\n");

  const { content, askBack } = splitAskBack(fullText || STUB_CONTENT[lang].content);
  const summary =
    content.split("\n").find((line) => line.trim().length > 0)?.slice(0, 200) ?? content.slice(0, 200);

  const entry = await prisma.newsletterEntry.create({
    data: { summary, content, askBack },
  });

  if (settings?.wechatWebhookUrl) {
    const sent = await pushToWeChat(settings.wechatWebhookUrl, `${summary}\n\n${content}`);
    if (sent) {
      return prisma.newsletterEntry.update({ where: { id: entry.id }, data: { sentToWeChat: true } });
    }
  }

  return entry;
}
