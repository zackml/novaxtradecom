import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { FakeLineChart, Sparkline } from "@/components/fake-chart";
import { CoinIcon } from "@/components/coin-icon";
import { COINS, formatPrice } from "@/lib/market-data";
import heroCrypto3d from "@/assets/hero-crypto-3d.png";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Globe2,
  Lock,
  BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NovaX — Modern Crypto Trading Platform" },
      {
        name: "description",
        content: "A modern cryptocurrency trading platform. Live charts, portfolio, and secure deposits.",
      },
      { property: "og:title", content: "NovaX — Modern Crypto Trading Platform" },
      { property: "og:description", content: "Trading dashboard, portfolio and live markets." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero — Figma 3D style with glassmorphism + animated mesh gradient */}
      <section className="relative overflow-hidden">
        {/* Animated mesh gradient background */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-primary/40 blur-[120px] animate-mesh-drift" />
          <div
            className="absolute top-10 right-0 h-[560px] w-[560px] rounded-full bg-accent/40 blur-[130px] animate-mesh-drift"
            style={{ animationDelay: "-6s" }}
          />
          <div
            className="absolute bottom-0 left-1/3 h-[460px] w-[460px] rounded-full bg-chart-3/40 blur-[120px] animate-mesh-drift"
            style={{ animationDelay: "-12s" }}
          />
          <div className="absolute inset-0 grid-bg opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        </div>

        <div className="container relative mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div className="animate-slide-up text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Live markets · Real-time precision
              </div>
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05]">
                Trade the Future with{" "}
                <span className="text-gradient">Precision</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl lg:max-w-none lg:pr-8 mx-auto lg:mx-0">
                A next-generation crypto trading interface. Lightning-fast execution,
                institutional-grade tools, built for serious traders.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3">
                <Button
                  asChild
                  variant="hero"
                  size="xl"
                  className="animate-cta-glow rounded-full"
                >
                  <Link to="/auth/register">
                    Start Trading Now <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="glass" size="xl" className="rounded-full">
                  <Link to="/markets">Explore Markets</Link>
                </Button>
              </div>

              {/* Floating glass stat cards */}
              <div className="mt-12 grid grid-cols-3 gap-4 max-w-xl mx-auto lg:mx-0">
                {[
                  { v: "$2.4B", l: "24h Volume" },
                  { v: "1.2M+", l: "Traders" },
                  { v: "350+", l: "Pairs" },
                ].map((s, i) => (
                  <div
                    key={s.l}
                    className="glass-strong rounded-2xl p-4 shadow-elegant animate-float"
                    style={{ animationDelay: `${i * 0.6}s` }}
                  >
                    <div className="text-2xl font-bold text-gradient">{s.v}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 3D crypto illustration with orbiting glass cards */}
            <div className="relative h-[460px] md:h-[560px] lg:h-[620px] animate-fade-in">
              {/* Radial glow behind */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-[360px] w-[360px] md:h-[460px] md:w-[460px] rounded-full bg-gradient-primary opacity-30 blur-3xl animate-glow-pulse" />
              </div>

              {/* Main 3D image */}
              <img
                src={heroCrypto3d}
                alt="3D crypto coins floating"
                width={1024}
                height={1024}
                className="relative z-10 mx-auto h-full w-auto object-contain animate-float-slow drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
              />

              {/* Orbiting glass card — top left */}
              <div
                className="hidden md:flex absolute top-6 left-0 z-20 glass-strong rounded-2xl p-4 shadow-elegant min-w-[180px] animate-float"
                style={{ animationDelay: "-2s" }}
              >
                <div className="flex items-center gap-3">
                  <CoinIcon symbol="BTC" size={32} />
                  <div>
                    <div className="text-xs text-muted-foreground">BTC / USDT</div>
                    <div className="font-semibold">$67,482</div>
                    <div className="text-xs text-success">+2.34%</div>
                  </div>
                </div>
              </div>

              {/* Orbiting glass card — bottom right */}
              <div
                className="hidden md:flex absolute bottom-10 right-0 z-20 glass-strong rounded-2xl p-4 shadow-elegant min-w-[180px] animate-float"
                style={{ animationDelay: "-4s" }}
              >
                <div className="flex items-center gap-3">
                  <CoinIcon symbol="ETH" size={32} />
                  <div>
                    <div className="text-xs text-muted-foreground">ETH / USDT</div>
                    <div className="font-semibold">$3,824</div>
                    <div className="text-xs text-success">+1.12%</div>
                  </div>
                </div>
              </div>

              {/* Orbiting sparkline card — middle right */}
              <div
                className="hidden lg:block absolute top-1/2 -right-4 z-20 glass-strong rounded-2xl p-3 shadow-elegant animate-float-slow"
                style={{ animationDelay: "-3s" }}
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Portfolio
                </div>
                <Sparkline seed={7} bullish />
              </div>
            </div>
          </div>

          {/* Hero chart preview */}
          <div className="mt-20 mx-auto max-w-5xl animate-fade-in">
            <div className="glass-strong rounded-2xl p-6 shadow-elegant">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CoinIcon symbol="BTC" />
                  <div>
                    <div className="font-semibold">BTC / USDT</div>
                    <div className="text-xs text-muted-foreground">Bitcoin</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">$67,482.21</div>
                  <div className="text-sm text-success">+2.34% (24h)</div>
                </div>
              </div>
              <FakeLineChart seed={9} bullish height={320} />
            </div>
          </div>
        </div>
      </section>

      {/* Live ticker */}
      <section className="border-y border-border/50 bg-background/40 backdrop-blur py-4 overflow-hidden">
        <div className="flex gap-12 animate-ticker whitespace-nowrap">
          {[...COINS, ...COINS].map((c, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <CoinIcon symbol={c.symbol} size={24} />
              <span className="font-semibold">{c.symbol}</span>
              <span className="text-muted-foreground">${formatPrice(c.price)}</span>
              <span className={c.change24h >= 0 ? "text-success" : "text-destructive"}>
                {c.change24h >= 0 ? "+" : ""}
                {c.change24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Built for <span className="text-gradient">professional traders</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Every feature you need, none of the friction you don't.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: "Lightning Execution", desc: "Sub-millisecond order routing across global liquidity." },
            { icon: ShieldCheck, title: "Bank-grade Security", desc: "Cold storage, MPC custody, and 24/7 monitoring." },
            { icon: TrendingUp, title: "Advanced Charts", desc: "Pro charting tools with 100+ indicators." },
            { icon: Globe2, title: "Global Markets", desc: "Trade 350+ pairs across spot, futures and options." },
            { icon: Lock, title: "Self-Custody Optional", desc: "Connect your wallet or use our managed accounts." },
            { icon: BarChart3, title: "Deep Analytics", desc: "Portfolio insights, P&L breakdowns, risk metrics." },
          ].map((f) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-6 hover:border-primary/40 transition-all hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary mb-4 shadow-glow">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top movers */}
      <section className="container mx-auto px-4 pb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Top Movers</h2>
            <p className="text-muted-foreground text-sm mt-1">Most active assets in the last 24 hours</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/markets">View all <ArrowRight /></Link>
          </Button>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/50">
            <div className="col-span-5">Asset</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">24h</div>
            <div className="col-span-3 text-right">Chart</div>
          </div>
          {COINS.slice(0, 6).map((c) => (
            <div
              key={c.symbol}
              className="grid grid-cols-12 items-center px-6 py-4 border-b border-border/30 last:border-0 hover:bg-white/5 transition"
            >
              <div className="col-span-5 flex items-center gap-3">
                <CoinIcon symbol={c.symbol} />
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.symbol}</div>
                </div>
              </div>
              <div className="col-span-2 text-right font-medium">${formatPrice(c.price)}</div>
              <div className={`col-span-2 text-right text-sm ${c.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                {c.change24h >= 0 ? "+" : ""}{c.change24h.toFixed(2)}%
              </div>
              <div className="col-span-3">
                <Sparkline seed={c.seed} bullish={c.change24h >= 0} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24">
        <div className="glass-strong rounded-3xl p-12 md:p-16 text-center relative overflow-hidden shadow-elegant">
          <div className="absolute inset-0 bg-gradient-primary opacity-15" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 bg-primary rounded-full blur-3xl opacity-30" />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold">Start trading in seconds</h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Open your free account and explore the platform.
            </p>
            <Button asChild variant="hero" size="xl" className="mt-8">
              <Link to="/dashboard">Get Started <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          © {new Date().getFullYear()} NovaX. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
