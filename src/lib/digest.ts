// Shared helpers for the AI Newsletter and Crypto News digests — both use the
// same "ask a clarifying question, learn from Lee's reaction" personalization loop.

export function splitAskBack(text: string): { content: string; askBack: string | null } {
  const marker = "QUESTION:";
  const idx = text.lastIndexOf(marker);
  if (idx === -1) return { content: text.trim(), askBack: null };
  return {
    content: text.slice(0, idx).trim(),
    askBack: text.slice(idx + marker.length).trim(),
  };
}

export function feedbackLabel(feedback: string): string {
  if (feedback === "more") return "wants more like this";
  if (feedback === "less") return "not interested / wants less like this";
  if (feedback === "known") return "already knew this — go deeper or skip it next time";
  return feedback;
}

export function formatHistoryEntry(
  summary: string,
  feedback: string | null,
  feedbackNote: string | null
): string {
  const parts = [`- "${summary.slice(0, 100)}"`];
  if (feedback) parts.push(`[reaction: ${feedbackLabel(feedback)}]`);
  if (feedbackNote) parts.push(`[Lee said: "${feedbackNote}"]`);
  return parts.join(" ");
}

export type StoredSource = { url: string; title: string; feedback: "up" | "down" | null };

export type FollowUp = { question: string; answer: string; createdAt: string };

export function toStoredSources(sources: { url: string; title: string }[]): StoredSource[] {
  return sources.map((s) => ({ ...s, feedback: null }));
}

// Rolls up per-source thumbs up/down across recent entries into a signal the
// model can act on: which kinds of sources to seek out vs. avoid going forward.
export function buildSourceFeedbackContext(entries: { sources: unknown }[]): string {
  const liked: string[] = [];
  const disliked: string[] = [];
  for (const e of entries) {
    const sources = Array.isArray(e.sources) ? (e.sources as StoredSource[]) : [];
    for (const s of sources) {
      if (s.feedback === "up") liked.push(s.title);
      else if (s.feedback === "down") disliked.push(s.title);
    }
  }
  if (liked.length === 0 && disliked.length === 0) return "(no source ratings yet)";
  const parts: string[] = [];
  if (liked.length > 0) {
    parts.push(
      `Rated positively by Lee (seek out similar — fresh, specific, ahead-of-the-curve reporting, not just recaps): ${liked
        .slice(0, 8)
        .map((t) => `"${t}"`)
        .join(", ")}`
    );
  }
  if (disliked.length > 0) {
    parts.push(
      `Rated negatively by Lee (avoid similar — generic, stale, or purely mainstream-recap sources): ${disliked
        .slice(0, 8)
        .map((t) => `"${t}"`)
        .join(", ")}`
    );
  }
  return parts.join("\n");
}
