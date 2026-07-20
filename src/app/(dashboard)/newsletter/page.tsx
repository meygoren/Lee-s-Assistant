"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { NewsletterEntry } from "@/generated/prisma";

export default function NewsletterPage() {
  const { dict } = useLanguage();
  const [entries, setEntries] = useState<NewsletterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/newsletter");
    const data = await res.json();
    setEntries(data.entries ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      await fetch("/api/newsletter/generate", { method: "POST" });
      await load();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-50">{dict.newsletter.title}</h1>
        <p className="text-sm text-zinc-400">{dict.newsletter.subtitle}</p>
      </div>

      <button
        onClick={generate}
        disabled={generating}
        className="mb-6 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generating ? dict.newsletter.generating : dict.newsletter.generate}
      </button>

      {!loading && entries.length === 0 && <p className="text-sm text-zinc-500">{dict.newsletter.empty}</p>}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
              <span>{new Date(entry.createdAt).toLocaleString()}</span>
              {entry.sentToWeChat && <span className="text-cyan-400">WeChat ✓</span>}
            </div>
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-zinc-200">
              {entry.content}
            </div>
            {entry.askBack && (
              <div className="mt-3 rounded-lg bg-cyan-500/10 p-3 text-sm text-cyan-200">
                <span className="font-medium">{dict.newsletter.askBackTitle}: </span>
                {entry.askBack}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
