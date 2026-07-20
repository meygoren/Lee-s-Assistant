"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useCryptoPrices } from "@/lib/useCryptoPrices";
import { resolveCoins } from "@/lib/crypto";
import { PriceTriangle } from "@/components/PriceTriangle";

function formatPrice(usd: number) {
  return usd >= 1
    ? usd.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })
    : usd.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 6 });
}

export function CryptoTicker({ coinIds }: { coinIds: string[] }) {
  const { lang } = useLanguage();
  const coins = resolveCoins(coinIds);
  const { prices, ticks, loading } = useCryptoPrices(coinIds);

  if (coins.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5">
      {coins.map((coin) => {
        const price = prices[coin.id];
        const change = price?.usd_24h_change ?? null;
        const isUp = typeof change === "number" && change > 0.005;
        const isDown = typeof change === "number" && change < -0.005;
        const tick = ticks[coin.id];
        return (
          <div
            key={coin.id}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 transition-colors duration-700 ${
              tick === "up"
                ? "bg-emerald-500/15"
                : tick === "down"
                ? "bg-orange-500/15"
                : "bg-zinc-950/60"
            }`}
          >
            <span className="text-xs font-semibold text-zinc-200">{coin.symbol}</span>
            {loading && !price ? (
              <span className="text-xs text-zinc-600">···</span>
            ) : price ? (
              <>
                <span className="text-xs tabular-nums text-zinc-300">{formatPrice(price.usd)}</span>
                <span
                  className={`flex items-center gap-1 text-xs tabular-nums ${
                    isUp ? "text-emerald-400" : isDown ? "text-orange-400" : "text-zinc-500"
                  }`}
                >
                  <PriceTriangle direction={isUp ? "up" : isDown ? "down" : "flat"} />
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
