"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";

type Source = { url: string; title: string; feedback: "up" | "down" | null };

export function SourceList({
  apiBase,
  entryId,
  sources,
  label,
}: {
  apiBase: string;
  entryId: string;
  sources: Source[];
  label: string;
}) {
  const [items, setItems] = useState(sources);

  if (items.length === 0) return null;

  const rate = async (url: string, feedback: "up" | "down") => {
    const current = items.find((s) => s.url === url)?.feedback;
    const next = current === feedback ? null : feedback;
    setItems((prev) => prev.map((s) => (s.url === url ? { ...s, feedback: next } : s)));
    await fetch(`${apiBase}/${entryId}/sources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, feedback: next }),
    });
  };

  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs font-medium text-zinc-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s) => (
          <div
            key={s.url}
            className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-950 py-1 pl-2.5 pr-1 text-xs text-zinc-400"
          >
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex max-w-[180px] items-center gap-1 truncate hover:text-cyan-300"
              title={s.title}
            >
              <span className="truncate">{s.title || s.url}</span>
              <ExternalLink size={10} strokeWidth={2} className="shrink-0" />
            </a>
            <button
              type="button"
              onClick={() => rate(s.url, "up")}
              className={`rounded-full p-1 ${
                s.feedback === "up" ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-500 hover:bg-zinc-800"
              }`}
            >
              <ThumbsUp size={11} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => rate(s.url, "down")}
              className={`rounded-full p-1 ${
                s.feedback === "down" ? "bg-orange-500/20 text-orange-400" : "text-zinc-500 hover:bg-zinc-800"
              }`}
            >
              <ThumbsDown size={11} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
