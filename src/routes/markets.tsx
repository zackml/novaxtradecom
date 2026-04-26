import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Search, Star, Loader2 } from "lucide-react";
import { useLiveCoins } from "@/hooks/use-live-coins";
import { formatLivePrice, formatCompact } from "@/lib/coingecko";
import { Sparkline } from "@/components/fake-chart";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Markets — NovaX" },
      { name: "description", content: "Live cryptocurrency prices powered by CoinGecko." },
    ],
  }),
  component: Markets,
});

function Markets() {
  const { coins, loading, error } = useLiveCoins(30);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "gainers" | "losers">("all");
  const [tick, setTick] = useState(0);

  // Animate brief flash when prices refresh
  useEffect(() => {
    if (coins.length) setTick((t) => t + 1);
  }, [coins]);

  const filtered = useMemo(() => {
    let out = coins;
    if (query) {
      const q = query.toLowerCase();
      out = out.filter(
        (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q),
      );
    }
    if (filter === "gainers") out = out.filter((c) => c.price_change_percentage_24h > 0);
    if (filter === "losers") out = out.filter((c) => c.price_change_percentage_24h < 0);
    return out;
  }, [coins, query, filter]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-end justify-between flex-wrap gap-3 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">Markets</h1>
            <p className="text-muted-foreground mt-1">
              Live prices from CoinGecko · auto-refresh every 60s
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">Live</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-2 mb-6 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-1 px-3 min-w-[200px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search assets…"
              className="bg-transparent flex-1 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="flex gap-1 pr-1">
            {(["all", "gainers", "losers"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition capitalize ${
                  filter === t
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-white/5"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading && coins.length === 0 ? (
          <div className="glass rounded-2xl p-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading live market data…
          </div>
        ) : error ? (
          <div className="glass rounded-2xl p-8 text-center text-destructive">
            Failed to load market data: {error}
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden" key={tick}>
            <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/50">
              <div className="col-span-1"></div>
              <div className="col-span-3">Asset</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">24h</div>
              <div className="col-span-2 text-right hidden md:block">Volume</div>
              <div className="col-span-2 text-right">7d</div>
            </div>
            {filtered.map((c) => {
              const up = c.price_change_percentage_24h >= 0;
              const spark = c.sparkline_in_7d?.price ?? [];
              return (
                <div
                  key={c.id}
                  className="grid grid-cols-12 items-center px-6 py-4 border-b border-border/30 last:border-0 hover:bg-white/5 transition"
                >
                  <button className="col-span-1 text-muted-foreground hover:text-warning">
                    <Star className="h-4 w-4" />
                  </button>
                  <div className="col-span-3 flex items-center gap-3">
                    <img src={c.image} alt={c.name} className="h-8 w-8 rounded-full" />
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {c.symbol}/USDT
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-right font-medium tabular-nums">
                    ${formatLivePrice(c.current_price)}
                  </div>
                  <div
                    className={`col-span-2 text-right tabular-nums ${
                      up ? "text-success" : "text-destructive"
                    }`}
                  >
                    {up ? "+" : ""}
                    {c.price_change_percentage_24h?.toFixed(2)}%
                  </div>
                  <div className="col-span-2 text-right text-sm text-muted-foreground hidden md:block">
                    {formatCompact(c.total_volume)}
                  </div>
                  <div className="col-span-2">
                    <MiniSparkline data={spark} bullish={up} />
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">No matches.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function MiniSparkline({ data, bullish }: { data: number[]; bullish: boolean }) {
  if (!data.length) return <Sparkline seed={1} bullish={bullish} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 28;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke = bullish ? "var(--success)" : "var(--destructive)";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}
