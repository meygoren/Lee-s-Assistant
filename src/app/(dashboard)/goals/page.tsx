"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Goal } from "@/generated/prisma";

type GoalDraft = {
  title: string;
  description: string;
  category: string;
  targetDate: string;
  progress: number;
};

const EMPTY_DRAFT: GoalDraft = { title: "", description: "", category: "", targetDate: "", progress: 0 };

export default function GoalsPage() {
  const { dict } = useLanguage();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<GoalDraft>(EMPTY_DRAFT);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/goals");
    const data = await res.json();
    setGoals(data.goals ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, []);

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draft.title,
        description: draft.description || null,
        category: draft.category || null,
        targetDate: draft.targetDate || null,
        progress: draft.progress,
      }),
    });
    setDraft(EMPTY_DRAFT);
    setShowForm(false);
    load();
  };

  const updateGoal = async (id: string, data: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
    await fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const deleteGoal = async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
  };

  const statusLabel = (status: string) =>
    status === "completed"
      ? dict.goals.statusCompleted
      : status === "archived"
      ? dict.goals.statusArchived
      : dict.goals.statusActive;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">{dict.goals.title}</h1>
          <p className="text-sm text-zinc-400">{dict.goals.subtitle}</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-400"
        >
          + {dict.goals.addGoal}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={addGoal}
          className="mb-6 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:grid-cols-2"
        >
          <input
            placeholder={dict.goals.titleLabel}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-cyan-500 sm:col-span-2"
            autoFocus
          />
          <textarea
            placeholder={dict.goals.descriptionLabel}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-cyan-500 sm:col-span-2"
            rows={2}
          />
          <input
            placeholder={dict.goals.categoryLabel}
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-cyan-500"
          />
          <input
            type="date"
            value={draft.targetDate}
            onChange={(e) => setDraft({ ...draft, targetDate: e.target.value })}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-cyan-500"
          />
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-400"
            >
              {dict.goals.save}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              {dict.goals.cancel}
            </button>
          </div>
        </form>
      )}

      {!loading && goals.length === 0 && (
        <p className="text-sm text-zinc-500">{dict.goals.empty}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <div key={goal.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="font-medium text-zinc-100">{goal.title}</h3>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="text-xs text-zinc-500 hover:text-red-400"
              >
                {dict.goals.delete}
              </button>
            </div>
            {goal.description && <p className="mb-2 text-sm text-zinc-400">{goal.description}</p>}
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              {goal.category && (
                <span className="rounded-full bg-zinc-800 px-2 py-0.5">{goal.category}</span>
              )}
              <span className="rounded-full bg-zinc-800 px-2 py-0.5">{statusLabel(goal.status)}</span>
              {goal.targetDate && (
                <span>{new Date(goal.targetDate).toISOString().slice(0, 10)}</span>
              )}
            </div>
            <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-cyan-500 transition-all"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <input
                type="range"
                min={0}
                max={100}
                value={goal.progress}
                onChange={(e) => updateGoal(goal.id, { progress: Number(e.target.value) })}
                className="w-2/3 accent-cyan-500"
              />
              <span className="text-xs text-zinc-400">{goal.progress}%</span>
            </div>
            {goal.status !== "completed" && goal.progress === 100 && (
              <button
                onClick={() => updateGoal(goal.id, { status: "completed" })}
                className="mt-2 text-xs text-cyan-400 hover:underline"
              >
                {dict.goals.statusCompleted} →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
