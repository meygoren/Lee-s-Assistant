import { prisma } from "@/lib/prisma";
import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/anthropic";
import { resolveCoins } from "@/lib/crypto";
import type { CryptoNewsEntry } from "@/generated/prisma";

const STUB_CONTENT: Record<"zh" | "en", string> = {
  zh: "这是一个示例内容。配置好 Anthropic API Key 后，这里将显示你所关注的加密货币的最新新闻摘要。",
  en: "This is placeholder content. Once you add an Anthropic API key, this will show a fresh news summary for the coins you're tracking.",
};

export async function generateAndStoreCryptoNews(): Promise<CryptoNewsEntry> {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  const lang: "zh" | "en" = settings?.language === "en" ? "en" : "zh";
  const coins = resolveCoins(settings?.cryptoCoins as string[] | undefined);

  const client = getAnthropicClient();
  if (!client || coins.length === 0) {
    return prisma.cryptoNewsEntry.create({ data: { content: STUB_CONTENT[lang] } });
  }

  const languageInstruction =
    lang === "zh" ? "Write your response in Mandarin Chinese." : "Write your response in English.";
  const coinList = coins.map((c) => `${c.name.en} (${c.symbol})`).join(", ");

  const systemPrompt = `You are a crypto news assistant for Lee, who is not a technical/professional trader — keep it plain-language and practical, not jargon-heavy.

Search the web for the most significant recent news (last 1-2 days) affecting these specific cryptocurrencies: ${coinList}.

For each coin with notable news, write a short section: a bold coin name heading, then 1-3 sentences on what happened and why it matters. Skip coins with nothing notable rather than padding. End with a one-sentence overall market mood/context note if relevant.

${languageInstruction}

Keep the whole digest readable in under two minutes. Format as Markdown.`;

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1800,
    system: systemPrompt,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
    messages: [
      { role: "user", content: `Search for the latest news on ${coinList} and write my digest.` },
    ],
  });

  const fullText = response.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("\n\n");

  return prisma.cryptoNewsEntry.create({ data: { content: fullText.trim() || STUB_CONTENT[lang] } });
}
