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

    const callGemini = (withSearch: boolean) =>
      client.models.generateContent({
        model: GEMINI_MODEL,
        contents: opts.userMessage,
        config: {
          systemInstruction: withSearch
            ? opts.systemPrompt
            : `${opts.systemPrompt}\n\nLive web search isn't available right now, so answer from your general knowledge instead of searching. If asked for "today's" news, be upfront that this may not reflect the very latest headlines.`,
          tools: withSearch ? [{ googleSearch: {} }] : undefined,
        },
      });

    try {
      const response = await callGemini(Boolean(opts.webSearch));
      return response.text ?? null;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const isQuotaError = message.includes("429") || message.includes("RESOURCE_EXHAUSTED");

      // Search Grounding has its own quota, separate from (and often stricter than)
      // the base text-generation quota on the free tier. If a search-grounded call
      // gets quota-limited, retry once without it instead of failing outright.
      if (isQuotaError && opts.webSearch) {
        // Logged (not swallowed) even on a successful fallback, since this is
        // otherwise invisible — check Vercel's Runtime Logs for the exact
        // quota/permission text Google returned for the search-grounded call.
        console.warn("Gemini search grounding failed, falling back without search:", message);
        try {
          const fallback = await callGemini(false);
          return fallback.text ?? null;
        } catch {
          // fall through to the quota error below
        }
      }

      if (isQuotaError) {
        throw new Error(
          "Gemini's free-tier rate limit was hit. This usually clears within a minute — wait a bit and try again. If it keeps happening, check your usage at https://ai.dev/rate-limit."
        );
      }
      throw err;
    }
  }

  return null;
}
