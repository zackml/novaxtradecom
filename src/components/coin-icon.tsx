interface Props {
  symbol: string;
  size?: number;
}

const COLORS: Record<string, string> = {
  BTC: "linear-gradient(135deg,#F7931A,#FFB347)",
  ETH: "linear-gradient(135deg,#627EEA,#8FA8FF)",
  SOL: "linear-gradient(135deg,#9945FF,#14F195)",
  BNB: "linear-gradient(135deg,#F3BA2F,#FFD86B)",
  XRP: "linear-gradient(135deg,#23292F,#5A6470)",
  ADA: "linear-gradient(135deg,#0033AD,#3468D1)",
  DOGE: "linear-gradient(135deg,#C2A633,#E6D078)",
  AVAX: "linear-gradient(135deg,#E84142,#FF7A7B)",
  LINK: "linear-gradient(135deg,#2A5ADA,#5C8AFF)",
  MATIC: "linear-gradient(135deg,#8247E5,#A87BFF)",
};

export function CoinIcon({ symbol, size = 36 }: Props) {
  const bg = COLORS[symbol] ?? "linear-gradient(135deg,var(--accent),var(--primary))";
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white shrink-0"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}
    >
      {symbol.slice(0, 1)}
    </div>
  );
}
