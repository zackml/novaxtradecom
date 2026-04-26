import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { FakeLineChart } from "@/components/fake-chart";
import { CoinIcon } from "@/components/coin-icon";
import { formatPrice } from "@/lib/market-data";
import { Mail, Shield, Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — NovaX" },
      { name: "description", content: "Your crypto portfolio overview, allocations and balance history." },
    ],
  }),
  component: Portfolio,
});

const HOLDINGS = [
  { symbol: "BTC", name: "Bitcoin", amount: 0.4821, price: 67482.21, alloc: 56.2, change: 2.34 },
  { symbol: "ETH", name: "Ethereum", amount: 4.21, price: 3521.88, alloc: 25.4, change: 3.12 },
  { symbol: "SOL", name: "Solana", amount: 32.5, price: 168.42, alloc: 9.1, change: 5.78 },
  { symbol: "USDT", name: "Tether", amount: 2480, price: 1, alloc: 6.4, change: 0.0 },
  { symbol: "LINK", name: "Chainlink", amount: 75.2, price: 14.92, alloc: 2.9, change: 2.91 },
];

const ALLOC_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Portfolio() {
  const total = HOLDINGS.reduce((s, h) => s + h.amount * h.price, 0);

  // Donut math
  let cumulative = 0;
  const segments = HOLDINGS.map((h, i) => {
    const start = cumulative;
    cumulative += h.alloc;
    return { ...h, start, end: cumulative, color: ALLOC_COLORS[i] };
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="glass-strong rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden animate-fade-in">
          <div className="absolute -top-24 -right-24 h-64 w-64 bg-gradient-primary rounded-full blur-3xl opacity-30" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary blur-lg opacity-60" />
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                A
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Alex Morgan</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                  Verified
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> alex@novax.demo
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <div className="text-4xl font-bold">${total.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-success">+12.84% all time</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="glass" size="sm"><Shield /> Security</Button>
              <Button variant="glass" size="sm"><SettingsIcon /> Settings</Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Balance History</h2>
              <div className="flex gap-1">
                {["7D", "1M", "3M", "1Y", "ALL"].map((t, i) => (
                  <button
                    key={t}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                      i === 1 ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <FakeLineChart seed={77} bullish height={280} />
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Allocation</h2>
            <div className="flex items-center justify-center my-4">
              <Donut segments={segments} />
            </div>
            <div className="space-y-2 mt-4">
              {segments.map((s) => (
                <div key={s.symbol} className="flex items-center gap-3 text-sm">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="flex-1">{s.symbol}</span>
                  <span className="text-muted-foreground">{s.alloc.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Holdings table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <h2 className="font-semibold">Holdings</h2>
            <div className="flex gap-2">
              <Button asChild variant="glass" size="sm"><Link to="/deposit">Deposit</Link></Button>
              <Button asChild variant="hero" size="sm"><Link to="/withdraw">Withdraw</Link></Button>
            </div>
          </div>
          <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/50">
            <div className="col-span-4">Asset</div>
            <div className="col-span-2 text-right">Holdings</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Value</div>
            <div className="col-span-2 text-right">24h</div>
          </div>
          {HOLDINGS.map((h) => (
            <div key={h.symbol} className="grid grid-cols-12 items-center px-6 py-4 border-b border-border/30 last:border-0 hover:bg-white/5 transition">
              <div className="col-span-4 flex items-center gap-3">
                <CoinIcon symbol={h.symbol} />
                <div>
                  <div className="font-semibold">{h.name}</div>
                  <div className="text-xs text-muted-foreground">{h.symbol}</div>
                </div>
              </div>
              <div className="col-span-2 text-right text-sm">{h.amount} {h.symbol}</div>
              <div className="col-span-2 text-right text-sm">${formatPrice(h.price)}</div>
              <div className="col-span-2 text-right font-medium">
                ${(h.amount * h.price).toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </div>
              <div className={`col-span-2 text-right text-sm ${h.change >= 0 ? "text-success" : "text-destructive"}`}>
                {h.change >= 0 ? "+" : ""}{h.change.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Donut({ segments }: { segments: { alloc: number; color: string; symbol: string; start: number }[] }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 200 200" className="h-48 w-48 -rotate-90">
      <circle cx="100" cy="100" r={r} fill="none" stroke="var(--muted)" strokeWidth="22" opacity="0.3" />
      {segments.map((s) => {
        const dash = (s.alloc / 100) * c;
        const offset = (s.start / 100) * c;
        return (
          <circle
            key={s.symbol}
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="22"
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-offset}
          />
        );
      })}
    </svg>
  );
}
