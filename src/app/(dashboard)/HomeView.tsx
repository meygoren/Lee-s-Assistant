"use client";

import { Globe } from "@/components/globe/Globe";
import { AssistantPanel } from "@/components/AssistantPanel";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function HomeView({ notificationCount }: { notificationCount: number }) {
  const { dict } = useLanguage();

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6 lg:flex-row">
      <div className="flex flex-1 flex-col">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-zinc-50">{dict.home.title}</h1>
          <p className="text-sm text-zinc-400">{dict.home.subtitle}</p>
        </div>
        <div className="min-h-[320px] flex-1 overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
          <Globe notificationCount={notificationCount} />
        </div>
      </div>
      <div className="h-[420px] lg:h-auto lg:w-[420px]">
        <AssistantPanel />
      </div>
    </div>
  );
}
