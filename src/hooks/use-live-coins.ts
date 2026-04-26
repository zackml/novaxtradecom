import { useEffect, useState } from "react";
import { fetchTopCoins, type LiveCoin } from "@/lib/coingecko";

const REFRESH_MS = 60_000; // 1 minute — respects CoinGecko free tier

export function useLiveCoins(limit = 25) {
  const [coins, setCoins] = useState<LiveCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchTopCoins(limit);
        if (!cancelled) {
          setCoins(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [limit]);

  return { coins, loading, error };
}
