"use client";

import { useEffect, useState } from "react";
import type { CoinPrice } from "@/lib/crypto";

const POLL_INTERVAL_MS = 10_000;

export function useCryptoPrices(coinIds: string[]) {
  const [prices, setPrices] = useState<Record<string, CoinPrice>>({});
  const [loading, setLoading] = useState(true);
  const idsKey = coinIds.join(",");

  useEffect(() => {
    if (idsKey.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reflect that there's nothing to load
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/crypto/prices?ids=${encodeURIComponent(idsKey)}`);
        const data = await res.json();
        if (!cancelled && data.prices) setPrices(data.prices);
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
    };
  }, [idsKey]);

  return { prices, loading };
}
