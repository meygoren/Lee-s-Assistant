"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type FollowUp = { question: string; answer: string; createdAt: string };

export function EntryConversation({
  apiBase,
  entryId,
  initialFollowUps,
  labels,
}: {
  apiBase: string;
  entryId: string;
  initialFollowUps: FollowUp[];
  labels: { askPlaceholder: string; ask: string; asking: string };
}) {
  const [followUps, setFollowUps] = useState(initialFollowUps);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);

  const ask = async () => {
    const q = question.trim();
    if (!q || asking) return;
    setAsking(true);
    setQuestion("");
    try {
      const res = await fetch(`${apiBase}/${entryId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.entry?.followUps)) setFollowUps(data.entry.followUps);
      }
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="mt-3 border-t border-zinc-800 pt-3">
      {followUps.length > 0 && (
        <div className="mb-3 space-y-2">
          {followUps.map((f, i) => (
            <div key={i} className="text-sm">
              <p className="text-zinc-300">
                <span className="font-medium text-cyan-300">Q: </span>
                {f.question}
              </p>
              <p className="text-zinc-400">
                <span className="font-medium text-zinc-500">A: </span>
                {f.answer}
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder={labels.askPlaceholder}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-cyan-500"
        />
        <button
          type="button"
          onClick={ask}
          disabled={asking || !question.trim()}
          className="flex items-center gap-1 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={12} strokeWidth={2} />
          {asking ? labels.asking : labels.ask}
        </button>
      </div>
    </div>
  );
}
