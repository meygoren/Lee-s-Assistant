"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { CalendarEvent } from "@/generated/prisma";

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const { dict, lang } = useLanguage();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDesc, setDraftDesc] = useState("");
  const [draftImportant, setDraftImportant] = useState(false);

  const loadEvents = async (forCursor: Date) => {
    const res = await fetch(`/api/events?month=${monthKey(forCursor)}`);
    const data = await res.json();
    setEvents(
      (data.events ?? []).map((e: CalendarEvent) => ({ ...e, date: new Date(e.date) }))
    );
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch when month changes
    loadEvents(cursor);
  }, [cursor]);

  const weekdayLabels =
    lang === "zh" ? ["日", "一", "二", "三", "四", "五", "六"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const monthLabel = new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
  }).format(cursor);

  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const key = toDateKey(new Date(e.date));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [events]);

  const selectedEvents = eventsByDay.get(toDateKey(selected)) ?? [];
  const todayKey = toDateKey(new Date());

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim()) return;
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draftTitle,
        description: draftDesc || null,
        date: selected.toISOString(),
        important: draftImportant,
      }),
    });
    setDraftTitle("");
    setDraftDesc("");
    setDraftImportant(false);
    setShowForm(false);
    loadEvents(cursor);
  };

  const deleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await fetch(`/api/events/${id}`, { method: "DELETE" });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-50">{dict.calendar.title}</h1>
        <p className="text-sm text-zinc-400">{dict.calendar.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800"
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="font-medium text-zinc-100">{monthLabel}</h2>
              <button
                onClick={() => {
                  const now = new Date();
                  setCursor(now);
                  setSelected(now);
                }}
                className="text-xs text-cyan-400 hover:underline"
              >
                {dict.calendar.today}
              </button>
            </div>
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800"
            >
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500">
            {weekdayLabels.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((day, i) => {
              if (!day) return <div key={i} />;
              const key = toDateKey(day);
              const dayEvents = eventsByDay.get(key) ?? [];
              const isSelected = key === toDateKey(selected);
              const isToday = key === todayKey;
              const hasImportant = dayEvents.some((e) => e.important);
              return (
                <button
                  key={i}
                  onClick={() => setSelected(day)}
                  className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-sm transition ${
                    isSelected
                      ? "bg-cyan-500 text-zinc-950"
                      : isToday
                      ? "border border-cyan-500/60 text-cyan-300"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  <span>{day.getDate()}</span>
                  {dayEvents.length > 0 && (
                    <span
                      className={`h-1 w-1 rounded-full ${
                        hasImportant ? "bg-orange-400" : isSelected ? "bg-zinc-950" : "bg-cyan-400"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium text-zinc-100">
              {new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
                month: "short",
                day: "numeric",
                weekday: "short",
              }).format(selected)}
            </h3>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1 rounded-lg bg-cyan-500 px-3 py-1 text-xs font-medium text-zinc-950 hover:bg-cyan-400"
            >
              <Plus size={14} strokeWidth={2} />
              {dict.calendar.addEvent}
            </button>
          </div>

          {showForm && (
            <form onSubmit={addEvent} className="mb-4 space-y-2 rounded-lg border border-zinc-800 p-3">
              <input
                autoFocus
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder={dict.calendar.addEvent}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-cyan-500"
              />
              <textarea
                value={draftDesc}
                onChange={(e) => setDraftDesc(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-cyan-500"
              />
              <label className="flex items-center gap-2 text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={draftImportant}
                  onChange={(e) => setDraftImportant(e.target.checked)}
                  className="accent-orange-400"
                />
                {dict.calendar.important}
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-cyan-400"
                >
                  {dict.calendar.save}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                >
                  {dict.calendar.cancel}
                </button>
              </div>
            </form>
          )}

          {selectedEvents.length === 0 && !showForm && (
            <p className="text-sm text-zinc-500">{dict.calendar.empty}</p>
          )}

          <div className="space-y-2">
            {selectedEvents.map((ev) => (
              <div key={ev.id} className="rounded-lg border border-zinc-800 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {ev.important && <Star size={13} strokeWidth={2} className="fill-orange-400 text-orange-400" />}
                    <span className="text-sm text-zinc-100">{ev.title}</span>
                  </div>
                  <button
                    onClick={() => deleteEvent(ev.id)}
                    className="text-xs text-zinc-500 hover:text-red-400"
                  >
                    {dict.calendar.delete}
                  </button>
                </div>
                {ev.description && <p className="mt-1 text-xs text-zinc-400">{ev.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
