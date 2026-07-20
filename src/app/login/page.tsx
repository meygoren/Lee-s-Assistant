"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function LoginPage() {
  const { dict, lang, setLang } = useLanguage();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(dict.login.error);
      }
    });
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-end">
          <button
            type="button"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            {lang === "zh" ? "English" : "中文"}
          </button>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-xl shadow-cyan-500/5 backdrop-blur">
          <h1 className="text-2xl font-semibold text-zinc-50">{dict.login.title}</h1>
          <p className="mt-1 text-sm text-zinc-400">{dict.login.subtitle}</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-zinc-400">
                {dict.login.passwordLabel}
              </label>
              <input
                id="password"
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-cyan-500"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={isPending || password.length === 0}
              className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-medium text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? dict.login.loading : dict.login.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
