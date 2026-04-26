import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

const NAMES = [
  "Ahmed K.", "Sara M.", "Omar T.", "Layla H.", "Yusuf A.",
  "Mariam S.", "Khaled R.", "Nour E.", "Hassan B.", "Dina F.",
  "Tariq L.", "Aya M.", "Ziad O.", "Hana Z.", "Karim D.",
  "Salma N.", "Ramy P.", "Fatima G.", "Adel V.", "Maya W.",
];

const ASSETS = ["BTC", "ETH", "SOL", "BNB", "XRP", "AVAX", "DOGE", "LINK"];

interface Profit {
  id: number;
  name: string;
  amount: number;
  asset: string;
}

function makeProfit(id: number): Profit {
  return {
    id,
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    amount: Math.round((Math.random() * 4900 + 100) * 100) / 100,
    asset: ASSETS[Math.floor(Math.random() * ASSETS.length)],
  };
}

export function ProfitTicker() {
  const [profits, setProfits] = useState<Profit[]>([]);

  useEffect(() => {
    // Generate on client only to avoid SSR hydration mismatch
    setProfits(Array.from({ length: 12 }, (_, i) => makeProfit(i)));
    let counter = 12;
    const id = setInterval(() => {
      counter += 1;
      setProfits((prev) => [...prev.slice(1), makeProfit(counter)]);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  if (profits.length === 0) {
    return <div className="border-y border-border/50 bg-success/5 py-2 h-9" />;
  }

  return (
    <div className="border-y border-border/50 bg-success/5 backdrop-blur py-2 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      <div className="flex gap-10 animate-ticker whitespace-nowrap">
        {[...profits, ...profits].map((p, i) => (
          <div key={`${p.id}-${i}`} className="flex items-center gap-2 text-xs">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20">
              <TrendingUp className="h-3 w-3 text-success" />
            </div>
            <span className="font-medium text-foreground">{p.name}</span>
            <span className="text-muted-foreground">just earned</span>
            <span className="font-semibold text-success">
              +${p.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-muted-foreground">on {p.asset}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
