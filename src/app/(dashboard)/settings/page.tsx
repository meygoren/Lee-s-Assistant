"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type SettingsData = {
  language: "zh" | "en";
  aiKnowledgeLevel: string;
  wechatWebhookUrl: string | null;
  anthropicKeyConfigured: boolean;
};

export default function SettingsPage() {
  const { dict, lang, setLang } = useLanguage();
  const [data, setData] = useState<SettingsData | null>(null);
  const [aiKnowledgeLevel, setAiKnowledgeLevel] = useState("");
  const [wechatWebhookUrl, setWechatWebhookUrl] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(({ settings }) => {
        setData(settings);
        setAiKnowledgeLevel(settings.aiKnowledgeLevel ?? "");
        setWechatWebhookUrl(settings.wechatWebhookUrl ?? "");
      });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiKnowledgeLevel, wechatWebhookUrl, language: lang }),
    });
    const { settings } = await res.json();
    setData((prev) => (prev ? { ...prev, ...settings } : prev));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-50">{dict.settings.title}</h1>
        <p className="text-sm text-zinc-400">{dict.settings.subtitle}</p>
      </div>

      <form onSubmit={save} className="max-w-xl space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <label className="mb-2 block text-sm font-medium text-zinc-200">{dict.settings.language}</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLang("zh")}
              className={`rounded-lg px-4 py-2 text-sm ${lang === "zh" ? "bg-cyan-500 text-zinc-950" : "border border-zinc-700 text-zinc-300"}`}
            >
              {dict.settings.languageZh}
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`rounded-lg px-4 py-2 text-sm ${lang === "en" ? "bg-cyan-500 text-zinc-950" : "border border-zinc-700 text-zinc-300"}`}
            >
              {dict.settings.languageEn}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <label className="mb-1 block text-sm font-medium text-zinc-200">{dict.settings.aiLevel}</label>
          <p className="mb-2 text-xs text-zinc-500">{dict.settings.aiLevelHelp}</p>
          <textarea
            value={aiKnowledgeLevel}
            onChange={(e) => setAiKnowledgeLevel(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-500"
          />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <label className="mb-1 block text-sm font-medium text-zinc-200">{dict.settings.wechat}</label>
          <p className="mb-2 text-xs text-zinc-500">{dict.settings.wechatHelp}</p>
          <input
            value={wechatWebhookUrl}
            onChange={(e) => setWechatWebhookUrl(e.target.value)}
            placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-500"
          />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h3 className="mb-2 text-sm font-medium text-zinc-200">{dict.settings.apiStatus}</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">{dict.settings.anthropicKey}</span>
            <span className={data?.anthropicKeyConfigured ? "text-cyan-400" : "text-zinc-500"}>
              {data?.anthropicKeyConfigured ? dict.settings.configured : dict.settings.notConfigured}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-400"
        >
          {saved ? dict.settings.saved : dict.settings.save}
        </button>
      </form>
    </div>
  );
}
