import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CoinIcon } from "@/components/coin-icon";
import { COINS } from "@/lib/market-data";
import { PAYMENT_CONFIG } from "@/lib/payment-config";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import {
  Copy, Info, ArrowDownToLine, Smartphone, Upload, CheckCircle2, Clock, XCircle,
} from "lucide-react";

export const Route = createFileRoute("/deposit")({
  head: () => ({
    meta: [
      { title: "Deposit — NovaX" },
      { name: "description", content: "Deposit funds via Vodafone Cash or crypto." },
    ],
  }),
  component: Deposit,
});

type Method = "vodafone" | "crypto";

interface DepositRow {
  id: string;
  amount: number;
  sender_phone: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  admin_note: string | null;
}

function Deposit() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("vodafone");
  const [asset, setAsset] = useState("BTC");
  const [history, setHistory] = useState<DepositRow[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadHistory() {
    const { data, error } = await supabase
      .from("deposits")
      .select("id, amount, sender_phone, status, created_at, admin_note")
      .order("created_at", { ascending: false })
      .limit(10);
    if (!error && data) setHistory(data as DepositRow[]);
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6 flex items-center gap-3 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-success">
            <ArrowDownToLine className="h-6 w-6 text-success-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Deposit</h1>
            <p className="text-muted-foreground text-sm">Add funds to your NovaX account.</p>
          </div>
        </div>

        {/* Method tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setMethod("vodafone")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
              method === "vodafone"
                ? "border-primary/60 bg-primary/10"
                : "border-border bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e60000]">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">Vodafone Cash</div>
              <div className="text-xs text-muted-foreground">Manual review</div>
            </div>
          </button>
          <button
            onClick={() => setMethod("crypto")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
              method === "crypto"
                ? "border-primary/60 bg-primary/10"
                : "border-border bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <CoinIcon symbol="BTC" size={24} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">Crypto</div>
              <div className="text-xs text-muted-foreground">BTC · ETH · USDT</div>
            </div>
          </button>
        </div>

        {method === "vodafone" ? (
          <VodafoneDepositForm onSubmitted={loadHistory} />
        ) : (
          <CryptoDeposit asset={asset} setAsset={setAsset} />
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-8 glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Your recent deposits</h3>
            <div className="space-y-2">
              {history.map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5">
                  <StatusBadge status={d.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">${Number(d.amount).toFixed(2)} EGP</div>
                    <div className="text-xs text-muted-foreground truncate">
                      From {d.sender_phone} · {new Date(d.created_at).toLocaleString()}
                    </div>
                    {d.admin_note && (
                      <div className="text-xs text-muted-foreground italic mt-0.5">
                        Admin: {d.admin_note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  if (status === "approved")
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-success/15 text-success text-xs font-medium">
        <CheckCircle2 className="h-3 w-3" /> Approved
      </div>
    );
  if (status === "rejected")
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/15 text-destructive text-xs font-medium">
        <XCircle className="h-3 w-3" /> Rejected
      </div>
    );
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-warning/15 text-warning text-xs font-medium">
      <Clock className="h-3 w-3" /> Pending
    </div>
  );
}

function VodafoneDepositForm({ onSubmitted }: { onSubmitted: () => void }) {
  const { user } = useAuth();
  const cfg = PAYMENT_CONFIG.vodafoneCash;

  const [amount, setAmount] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const copyWallet = () => {
    navigator.clipboard.writeText(cfg.walletNumber);
    toast.success("Wallet number copied");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!senderPhone.trim()) {
      toast.error("Enter the sender phone number");
      return;
    }
    if (!file) {
      toast.error("Please upload a screenshot of the receipt");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB");
      return;
    }

    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("receipts")
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("deposits").insert({
        user_id: user.id,
        method: "vodafone_cash",
        amount: amt,
        sender_phone: senderPhone.trim(),
        receipt_path: path,
        status: "pending",
      });
      if (insErr) throw insErr;

      toast.success("Deposit submitted! Awaiting admin approval.");
      setAmount("");
      setSenderPhone("");
      setFile(null);
      onSubmitted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="glass-strong rounded-2xl p-6 md:p-8 space-y-6">
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Send to this Vodafone Cash wallet
        </Label>
        <div className="mt-2 glass rounded-lg p-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e60000]">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold font-mono tracking-wider">{cfg.walletNumber}</div>
            <div className="text-xs text-muted-foreground">{cfg.holderName}</div>
          </div>
          <Button size="icon" variant="ghost" onClick={copyWallet}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="glass rounded-lg p-4 flex gap-3 text-xs">
        <Info className="h-4 w-4 shrink-0 text-accent mt-0.5" />
        <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
          {cfg.instructions.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-border/50">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount (EGP)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Sender phone number</Label>
            <Input
              id="phone"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="mt-1.5"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="receipt">Receipt screenshot</Label>
          <label
            htmlFor="receipt"
            className="mt-1.5 flex flex-col items-center justify-center gap-2 cursor-pointer glass rounded-lg p-6 border-2 border-dashed border-border hover:border-primary/50 transition"
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <div className="text-sm text-center">
              {file ? (
                <span className="text-foreground font-medium">{file.name}</span>
              ) : (
                <>
                  <span className="text-foreground">Click to upload</span>
                  <span className="text-muted-foreground"> or drag and drop</span>
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground">PNG, JPG up to 5 MB</div>
            <input
              id="receipt"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit for review"}
        </Button>
      </form>
    </div>
  );
}

function CryptoDeposit({ asset, setAsset }: { asset: string; setAsset: (s: string) => void }) {
  const address = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  return (
    <div className="glass-strong rounded-2xl p-6 md:p-8 space-y-6">
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Select asset</Label>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COINS.slice(0, 8).map((c) => (
            <button
              key={c.symbol}
              type="button"
              onClick={() => setAsset(c.symbol)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition ${
                asset === c.symbol
                  ? "border-primary/60 bg-primary/10"
                  : "border-border bg-white/5 hover:bg-white/10"
              }`}
            >
              <CoinIcon symbol={c.symbol} size={28} />
              <span className="text-sm font-medium">{c.symbol}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Your {asset} address
        </Label>
        <div className="mt-2 flex items-center gap-2 glass rounded-lg p-3">
          <code className="flex-1 text-xs md:text-sm font-mono break-all">{address}</code>
          <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(address)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="glass rounded-lg p-3 flex gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 text-accent mt-0.5" />
        <div>
          Send only {asset} to this address. Deposits are credited after network
          confirmations. For faster local deposits, use{" "}
          <Link to="/deposit" className="text-primary hover:underline">
            Vodafone Cash
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
