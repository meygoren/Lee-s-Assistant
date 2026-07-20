"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useCryptoPrices } from "@/lib/useCryptoPrices";
import { resolveCoins, DEFAULT_CRYPTO_COINS } from "@/lib/crypto";
import type { CryptoNewsEntry } from "@/generated/prisma";

function formatPrice(usd: number) {
  return usd >= 1
    ? usd.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })
    : usd.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 6 });
}

export default function CryptoPage() {
  const { dict, lang } = useLanguage();
  const [coinIds, setCoinIds] = useState<string[]>(DEFAULT_CRYPTO_COINS);
  const [entries, setEntries] = useState<CryptoNewsEntry[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [generating, setGenerating] = useState(false);
  const coins = resolveCoins(coinIds);
  const { prices, loading: loadingPrices } = useCryptoPrices(coinIds);

  const loadNews = async () => {
    setLoadingNews(true);
    const res = await fetch("/api/crypto/news");
    const data = await res.json();
    setEntries(data.entries ?? []);
    setLoadingNews(false);
  };

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(({ settings }) => {
        if (Array.isArray(settings.cryptoCoins) && settings.cryptoCoins.length > 0) {
          setCoinIds(settings.cryptoCoins);
        }
      });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    loadNews();
  }, []);

  const generateNews = async () => {
    setGenerating(true);
    try {
      await fetch("/api/crypto/news", { method: "POST" });
      await loadNews();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-50">{dict.crypto.title}</h1>
        <p className="text-sm text-zinc-400">{dict.crypto.subtitle}</p>
      </div>

      {coins.length === 0 ? (
        <p className="text-sm text-zinc-500">{dict.crypto.noCoins}</p>
      ) : (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coins.map((coin) => {
            const price = prices[coin.id];
            const change = price?.usd_24h_change ?? null;
            const isUp = typeof change === "number" && change > 0.005;
            const isDown = typeof change === "number" && change < -0.005;
            return (
              <div key={coin.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-zinc-100">{coin.name[lang]}</h3>
                    <p className="text-xs text-zinc-500">{coin.symbol}</p>
                  </div>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                      isUp
                        ? "bg-emerald-500/10 text-emerald-400"
                        : isDown
                        ? "bg-red-500/10 text-red-400"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {isUp ? <TrendingUp size={12} strokeWidth={2.5} /> : isDown ? <TrendingDown size={12} strokeWidth={2.5} /> : <Minus size={12} strokeWidth={2.5} />}
                    {typeof change === "number" ? `${change > 0 ? "+" : ""}${change.toFixed(2)}%` : "—"}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-zinc-50">
                  {loadingPrices && !price ? "···" : price ? formatPrice(price.usd) : "—"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{dict.crypto.change24h}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-100">{dict.crypto.news}</h2>
        <button
          onClick={generateNews}
          disabled={generating || coins.length === 0}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles size={16} strokeWidth={2} />
          {generating ? dict.crypto.newsGenerating : dict.crypto.newsGenerate}
        </button>
      </div>

      {!loadingNews && entries.length === 0 && <p className="text-sm text-zinc-500">{dict.crypto.newsEmpty}</p>}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="mb-2 text-xs text-zinc-500">{new Date(entry.createdAt).toLocaleString()}</p>
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-zinc-200">
              {entry.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
