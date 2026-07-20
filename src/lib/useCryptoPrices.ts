"use client";

import { useEffect, useRef, useState } from "react";
import type { CoinPrice } from "@/lib/crypto";

const POLL_INTERVAL_MS = 10_000;
const FLASH_DURATION_MS = 1000;

export type PriceTick = "up" | "down";

export function useCryptoPrices(coinIds: string[]) {
  const [prices, setPrices] = useState<Record<string, CoinPrice>>({});
  const [ticks, setTicks] = useState<Record<string, PriceTick>>({});
  const [loading, setLoading] = useState(true);
  const idsKey = coinIds.join(",");
  const prevPricesRef = useRef<Record<string, CoinPrice>>({});

  useEffect(() => {
    if (idsKey.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reflect that there's nothing to load
      setLoading(false);
      return;
    }

    let cancelled = false;
    let flashTimeout: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const res = await fetch(`/api/crypto/prices?ids=${encodeURIComponent(idsKey)}`);
        const data = await res.json();
        if (!cancelled && data.prices) {
          const nextPrices: Record<string, CoinPrice> = data.prices;
          const nextTicks: Record<string, PriceTick> = {};
          for (const [id, price] of Object.entries(nextPrices)) {
            const prev = prevPricesRef.current[id];
            if (prev && price.usd !== prev.usd) {
              nextTicks[id] = price.usd > prev.usd ? "up" : "down";
            }
          }
          prevPricesRef.current = nextPrices;
          setPrices(nextPrices);

          if (Object.keys(nextTicks).length > 0) {
            setTicks(nextTicks);
            clearTimeout(flashTimeout);
            flashTimeout = setTimeout(() => {
              if (!cancelled) setTicks({});
            }, FLASH_DURATION_MS);
          }
        }
      } catch {
        // keep showing the last known prices on a transient network error
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(flashTimeout);
    };
  }, [idsKey]);

  return { prices, ticks, loading };
}
