import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/anthropic";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";

export type AIProvider = "anthropic" | "gemini" | null;

// Anthropic is preferred when both are configured (generally higher quality),
// but Gemini's free tier means the app is fully usable without paying for anything.
export function getActiveProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

type GenerateOptions = {
  systemPrompt: string;
  userMessage: string;
  webSearch?: boolean;
  maxTokens?: number;
};

export async function generateAIText(opts: GenerateOptions): Promise<string | null> {
  const provider = getActiveProvider();

  if (provider === "anthropic") {
    const client = getAnthropicClient();
    if (!client) return null;
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: opts.maxTokens ?? 2000,
      system: opts.systemPrompt,
      tools: opts.webSearch ? [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }] : undefined,
      messages: [{ role: "user", content: opts.userMessage }],
    });
    return response.content
      .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
      .map((b) => b.text)
      .join("\n\n");
  }

  if (provider === "gemini") {
    const client = getGeminiClient();
    if (!client) return null;
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: opts.userMessage,
      config: {
        systemInstruction: opts.systemPrompt,
        tools: opts.webSearch ? [{ googleSearch: {} }] : undefined,
      },
    });
    return response.text ?? null;
  }

  return null;
}
