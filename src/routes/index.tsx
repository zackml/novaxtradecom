import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { CoinIcon } from "@/components/coin-icon";
import { COINS, formatPrice } from "@/lib/market-data";
import { ArrowRight, BarChart3, Lock, ShieldCheck, TrendingUp, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NovaX — Premium Crypto Trading" },
      {
        name: "description",
        content: "NovaX is a premium crypto trading interface with secure accounts, live markets, and a clean mobile-first experience.",
      },
      { property: "og:title", content: "NovaX — Premium Crypto Trading" },
      { property: "og:description", content: "Secure crypto trading with live market tools and a clean premium dashboard." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="relative isolate overflow-hidden border-b border-border/50">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_26%,transparent),transparent_34%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--accent)_20%,transparent),transparent_32%)]" />
          <div className="container relative mx-auto grid min-h-[calc(100svh-5rem)] grid-cols-1 items-center gap-10 px-4 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-success" />
                Live markets · Secure trading
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-normal sm:text-5xl md:text-6xl">
                Trade the Future with <span className="text-gradient">Precision</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0">
                A stable, premium trading experience built for fast decisions, clean portfolio visibility, and secure account access.
              </p>

              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                <Button asChild variant="hero" size="xl" className="rounded-full animate-cta-glow">
                  <Link to="/auth/register">
                    Start Trading Now <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="glass" size="xl" className="rounded-full">
                  <Link to="/dashboard">Open Dashboard</Link>
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  ["$2.4B", "Volume"],
                  ["350+", "Pairs"],
                  ["24/7", "Markets"],
                ].map(([value, label]) => (
                  <div key={label} className="glass rounded-xl p-3 text-center sm:p-4 lg:text-left">
                    <div className="text-xl font-bold text-foreground sm:text-2xl">{value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto w-full max-w-md lg:max-w-lg">
              <div className="glass-strong relative overflow-hidden rounded-3xl p-5 shadow-elegant sm:p-6">
                <div aria-hidden className="absolute inset-x-8 top-8 h-28 rounded-full bg-primary/20 blur-3xl" />
                <div className="relative rounded-2xl border border-border/60 bg-background/45 p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">NovaX Market</p>
                      <h2 className="mt-1 text-2xl font-bold">Live Overview</h2>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                      <BarChart3 className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {COINS.slice(0, 4).map((coin) => (
                      <div key={coin.symbol} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/40 p-3">
                        <div className="flex items-center gap-3">
                          <CoinIcon symbol={coin.symbol} size={34} />
                          <div>
                            <div className="font-semibold">{coin.symbol}</div>
                            <div className="text-xs text-muted-foreground">{coin.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">${formatPrice(coin.price)}</div>
                          <div className={coin.change24h >= 0 ? "text-xs text-success" : "text-xs text-destructive"}>
                            {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Protected accounts", text: "Secure onboarding and verified account access." },
              { icon: TrendingUp, title: "Market clarity", text: "Readable market snapshots without mobile clutter." },
              { icon: Zap, title: "Fast actions", text: "Direct paths to signup and dashboard workflows." },
            ].map((feature) => (
              <div key={feature.title} className="glass rounded-2xl p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary">
                  <feature.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="glass-strong rounded-3xl p-6 text-center shadow-elegant sm:p-10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold">Ready when you are</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Create your account with an invite reference and move into the dashboard when your profile is ready.
            </p>
            <Button asChild variant="hero" size="xl" className="mt-7 rounded-full animate-cta-glow">
              <Link to="/auth/register">
                Start Trading Now <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
