import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { TradingViewWidget } from "@/components/tradingview-widget";
import { useLiveCoins } from "@/hooks/use-live-coins";
import { formatLivePrice, SYMBOL_TO_TV } from "@/lib/coingecko";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  TrendingUp,
  TrendingDown,
  History,
  Lock,
  Zap,
} from "lucide-react";

interface AdjustmentRow {
  id: string;
  amount: number;
  reason: string | null;
  balance_after: number;
  created_at: string;
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NovaX" },
      { name: "description", content: "Live trading dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { coins } = useLiveCoins(12);

  const [balance, setBalance] = useState<number>(0);
  const [displayName, setDisplayName] = useState<string>("");
  const [history, setHistory] = useState<AdjustmentRow[]>([]);
  const [hasApprovedDeposit, setHasApprovedDeposit] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>("BTC");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("balance, display_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setBalance(Number(data.balance));
          setDisplayName(data.display_name ?? "");
        }
      });

    supabase
      .from("balance_adjustments")
      .select("id, amount, reason, balance_after, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setHistory(data as AdjustmentRow[]);
      });

    supabase
      .from("deposits")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .limit(1)
      .then(({ data }) => {
        setHasApprovedDeposit((data ?? []).length > 0);
      });
  }, [user]);

  if (!user) return null;

  const tradingUnlocked = hasApprovedDeposit && balance > 0;
  const selectedCoin = coins.find((c) => c.symbol.toUpperCase() === selected);
  const tvSymbol = SYMBOL_TO_TV[selected] ?? "BINANCE:BTCUSDT";

  function handleOpenTrade() {
    if (!tradingUnlocked) {
      toast.info("Please complete a deposit to start trading", {
        description: "Trading unlocks automatically once your deposit is approved.",
      });
      return;
    }
    toast.success(`Opening ${selected}/USDT position…`);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back{displayName ? `, ${displayName}` : ""}
            </h1>
            <p className="text-muted-foreground mt-1">
              Live market data and your portfolio at a glance.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="glass">
              <Link to="/deposit">
                <ArrowDownToLine /> Deposit
              </Link>
            </Button>
            <Button asChild variant="hero">
              <Link to="/withdraw">
                <ArrowUpFromLine /> Withdraw
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats — all real, zeroed for fresh accounts */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Account Balance"
            value={`$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            sub={hasApprovedDeposit ? "Available" : "Awaiting first deposit"}
            icon={Wallet}
            tone={balance > 0 ? "success" : "muted"}
          />
          <StatCard
            label="Total Transactions"
            value={String(history.length)}
            sub={history.length === 0 ? "No activity yet" : "Lifetime"}
            icon={History}
            tone="muted"
          />
          <StatCard
            label="Account Status"
            value={tradingUnlocked ? "Active" : "Locked"}
            sub={tradingUnlocked ? "Trading enabled" : "Deposit required"}
            icon={tradingUnlocked ? Zap : Lock}
            tone={tradingUnlocked ? "success" : "warning"}
          />
        </div>

        {!hasApprovedDeposit && (
          <div className="glass rounded-2xl p-5 mb-8 border border-warning/30 bg-warning/5 flex items-center gap-4 flex-wrap">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20 shrink-0">
              <Lock className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="font-semibold">Trading is locked</div>
              <div className="text-sm text-muted-foreground">
                Please complete a deposit to start trading. Your balance and
                history will start fresh from your first approved deposit.
              </div>
            </div>
            <Button asChild variant="hero">
              <Link to="/deposit">
                <ArrowDownToLine /> Make a deposit
              </Link>
            </Button>
          </div>
        )}

        {/* Live chart + currency selector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Watchlist (clickable) */}
          <div className="glass rounded-2xl p-4 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Markets</h3>
              <Link to="/markets" className="text-xs text-primary hover:underline">
                All
              </Link>
            </div>
            <div className="space-y-1 max-h-[460px] overflow-y-auto">
              {coins.map((c) => {
                const sym = c.symbol.toUpperCase();
                const supported = !!SYMBOL_TO_TV[sym];
                if (!supported) return null;
                const up = c.price_change_percentage_24h >= 0;
                const isActive = selected === sym;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(sym)}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition text-left ${
                      isActive
                        ? "bg-primary/15 border border-primary/30"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <img
                      src={c.image}
                      alt={c.name}
                      className="h-7 w-7 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{sym}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {c.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium tabular-nums">
                        ${formatLivePrice(c.current_price)}
                      </div>
                      <div
                        className={`text-[10px] ${up ? "text-success" : "text-destructive"}`}
                      >
                        {up ? "+" : ""}
                        {c.price_change_percentage_24h?.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chart panel */}
          <div className="glass rounded-2xl p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {selectedCoin && (
                  <img
                    src={selectedCoin.image}
                    alt={selectedCoin.name}
                    className="h-9 w-9 rounded-full"
                  />
                )}
                <div>
                  <div className="font-semibold text-lg">{selected} / USDT</div>
                  <div className="text-xs text-muted-foreground">
                    Real-time TradingView chart
                  </div>
                </div>
              </div>
              <Button
                variant={tradingUnlocked ? "hero" : "glass"}
                onClick={handleOpenTrade}
                disabled={!tradingUnlocked}
                title={
                  tradingUnlocked
                    ? `Open ${selected}/USDT position`
                    : "Deposit required"
                }
              >
                {tradingUnlocked ? (
                  <>
                    <Zap /> Open Trade
                  </>
                ) : (
                  <>
                    <Lock /> Open Trade
                  </>
                )}
              </Button>
            </div>
            <TradingViewWidget symbol={tvSymbol} height={460} />
          </div>
        </div>

        {/* Transaction history */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <History className="h-4 w-4" /> Transaction history
            </h3>
            <span className="text-xs text-muted-foreground">
              {history.length === 0
                ? "Empty"
                : `Last ${history.length} entr${history.length === 1 ? "y" : "ies"}`}
            </span>
          </div>
          {history.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              No transactions yet. Your first deposit will appear here once
              approved.
            </div>
          ) : (
            <div className="space-y-1">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/5"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      h.amount >= 0 ? "bg-success/15" : "bg-destructive/15"
                    }`}
                  >
                    {h.amount >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {h.reason || "Account adjustment"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(h.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-semibold tabular-nums ${
                        h.amount >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {h.amount >= 0 ? "+" : ""}
                      ${Number(h.amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      bal ${Number(h.balance_after).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "success" | "warning" | "muted";
}

function StatCard({ label, value, sub, icon: Icon, tone }: StatCardProps) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-muted-foreground";
  return (
    <div className="glass rounded-2xl p-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
        <Icon className={`h-4 w-4 ${toneClass}`} />
      </div>
      <div className="mt-3 text-2xl font-bold">{value}</div>
      <div className={`mt-1 text-xs ${toneClass}`}>{sub}</div>
    </div>
  );
}
