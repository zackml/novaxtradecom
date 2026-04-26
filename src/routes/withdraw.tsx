import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { CoinIcon } from "@/components/coin-icon";
import { COINS } from "@/lib/market-data";
import { ArrowUpFromLine, AlertTriangle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/withdraw")({
  head: () => ({
    meta: [
      { title: "Withdraw — NovaX" },
      { name: "description", content: "Withdraw crypto from your NovaX account." },
    ],
  }),
  component: Withdraw,
});

function Withdraw() {
  const [asset, setAsset] = useState("BTC");
  const [amount, setAmount] = useState("0.025");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6 flex items-center gap-3 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <ArrowUpFromLine className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Withdraw</h1>
            <p className="text-muted-foreground text-sm">Send crypto to an external wallet.</p>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-6 md:p-8 space-y-6">
          {/* Asset */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Asset</label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COINS.slice(0, 8).map((c) => (
                <button
                  key={c.symbol}
                  onClick={() => setAsset(c.symbol)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition ${
                    asset === c.symbol ? "border-primary/60 bg-primary/10" : "border-border bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <CoinIcon symbol={c.symbol} size={28} />
                  <span className="text-sm font-medium">{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Destination address</label>
            <input
              defaultValue=""
              placeholder={`Enter ${asset} address`}
              className="mt-2 w-full bg-white/5 border border-border rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary/60"
            />
          </div>

          {/* Network */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Network</label>
            <select className="mt-2 w-full bg-white/5 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/60">
              <option>Bitcoin</option>
              <option>Lightning</option>
              <option>Ethereum (ERC20)</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Amount</label>
              <div className="text-xs text-muted-foreground">
                Available: <span className="text-foreground">0.4821 {asset}</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 glass rounded-lg p-2 pl-4">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-lg font-semibold focus:outline-none"
              />
              <div className="text-sm text-muted-foreground">{asset}</div>
              <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary/20 text-primary hover:bg-primary/30 transition">
                MAX
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {["25%", "50%", "75%", "100%"].map((p) => (
                <button key={p} className="text-xs py-2 rounded-md bg-white/5 hover:bg-white/10 transition">{p}</button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="glass rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Network fee</span><span>0.0002 {asset}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">You will receive</span><span className="font-semibold">{amount} {asset}</span></div>
            <div className="flex justify-between pt-2 border-t border-border/50"><span className="text-muted-foreground">Estimated value</span><span>≈ $1,687.05</span></div>
          </div>

          <div className="glass rounded-lg p-3 flex gap-2 text-xs text-warning">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              Double-check the destination address. Crypto transactions are irreversible.
            </div>
          </div>

          <Button variant="hero" size="lg" className="w-full">Confirm withdrawal</Button>
        </div>
      </main>
    </div>
  );
}
