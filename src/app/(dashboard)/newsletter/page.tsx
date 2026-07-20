"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { MarkdownContent } from "@/components/MarkdownContent";
import type { NewsletterEntry } from "@/generated/prisma";

export default function NewsletterPage() {
  const { dict } = useLanguage();
  const [entries, setEntries] = useState<NewsletterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    try {
      const res = await fetch("/api/newsletter/generate", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Request failed (${res.status})`);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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
        className="mb-6 flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Sparkles size={16} strokeWidth={2} />
        {generating ? dict.newsletter.generating : dict.newsletter.generate}
      </button>

      {error && (
        <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {dict.newsletter.generateError}: {error}
        </p>
      )}

      {!loading && entries.length === 0 && <p className="text-sm text-zinc-500">{dict.newsletter.empty}</p>}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
              <span>{new Date(entry.createdAt).toLocaleString()}</span>
              <div className="flex items-center gap-3">
                {entry.sentToWeChat && (
                  <span className="flex items-center gap-1 text-cyan-400">
                    <CheckCircle2 size={14} strokeWidth={2} />
                    WeChat
                  </span>
                )}
                {entry.sentToTelegram && (
                  <span className="flex items-center gap-1 text-cyan-400">
                    <CheckCircle2 size={14} strokeWidth={2} />
                    Telegram
                  </span>
                )}
              </div>
            </div>
            <MarkdownContent content={entry.content} />
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
