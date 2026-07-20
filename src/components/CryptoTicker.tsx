"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useCryptoPrices } from "@/lib/useCryptoPrices";
import { resolveCoins } from "@/lib/crypto";

function formatPrice(usd: number) {
  return usd >= 1
    ? usd.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })
    : usd.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 6 });
}

export function CryptoTicker({ coinIds }: { coinIds: string[] }) {
  const { lang } = useLanguage();
  const coins = resolveCoins(coinIds);
  const { prices, loading } = useCryptoPrices(coinIds);

  if (coins.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5">
      {coins.map((coin) => {
        const price = prices[coin.id];
        const change = price?.usd_24h_change ?? null;
        const isUp = typeof change === "number" && change > 0.005;
        const isDown = typeof change === "number" && change < -0.005;
        return (
          <div
            key={coin.id}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-zinc-950/60 px-3 py-1.5"
          >
            <span className="text-xs font-semibold text-zinc-200">{coin.symbol}</span>
            {loading && !price ? (
              <span className="text-xs text-zinc-600">···</span>
            ) : price ? (
              <>
                <span className="text-xs text-zinc-300">{formatPrice(price.usd)}</span>
                <span
                  className={`flex items-center gap-0.5 text-xs ${
                    isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-zinc-500"
                  }`}
                >
                  {isUp ? <TrendingUp size={12} strokeWidth={2.5} /> : isDown ? <TrendingDown size={12} strokeWidth={2.5} /> : <Minus size={12} strokeWidth={2.5} />}
                  {typeof change === "number" ? `${change > 0 ? "+" : ""}${change.toFixed(2)}%` : "—"}
                </span>
              </>
            ) : (
              <span className="text-xs text-zinc-600">{lang === "zh" ? "无数据" : "no data"}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
