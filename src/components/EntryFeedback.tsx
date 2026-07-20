"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, GraduationCap } from "lucide-react";

type Reaction = "more" | "less" | "known";

const REACTIONS: { value: Reaction; Icon: typeof ThumbsUp }[] = [
  { value: "more", Icon: ThumbsUp },
  { value: "known", Icon: GraduationCap },
  { value: "less", Icon: ThumbsDown },
];

export function EntryFeedback({
  apiBase,
  entryId,
  initialFeedback,
  initialNote,
  askBack,
  labels,
}: {
  apiBase: string;
  entryId: string;
  initialFeedback: string | null;
  initialNote: string | null;
  askBack?: string | null;
  labels: {
    askBackTitle: string;
    more: string;
    known: string;
    less: string;
    notePlaceholder: string;
    saved: string;
  };
}) {
  const [feedback, setFeedback] = useState<Reaction | null>((initialFeedback as Reaction) ?? null);
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (nextFeedback: Reaction | null, nextNote: string) => {
    setSaving(true);
    setSaved(false);
    await fetch(`${apiBase}/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: nextFeedback, feedbackNote: nextNote || null }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const toggleReaction = (value: Reaction) => {
    const next = feedback === value ? null : value;
    setFeedback(next);
    save(next, note);
  };

  return (
    <div className="mt-3 border-t border-zinc-800 pt-3">
      {askBack && (
        <p className="mb-2 text-sm text-cyan-200">
          <span className="font-medium">{labels.askBackTitle}: </span>
          {askBack}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {REACTIONS.map(({ value, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => toggleReaction(value)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
              feedback === value
                ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            <Icon size={12} strokeWidth={2} />
            {labels[value]}
          </button>
        ))}
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => save(feedback, note)}
          placeholder={labels.notePlaceholder}
          className="min-w-[180px] flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-cyan-500"
        />
        {saving && <span className="text-xs text-zinc-500">…</span>}
        {saved && <span className="text-xs text-cyan-400">{labels.saved}</span>}
      </div>
    </div>
  );
}
