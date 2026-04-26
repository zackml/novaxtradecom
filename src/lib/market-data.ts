export interface Coin {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: string;
  volume: string;
  seed: number;
}

export const COINS: Coin[] = [
  { symbol: "BTC", name: "Bitcoin", price: 67_482.21, change24h: 2.34, marketCap: "$1.32T", volume: "$28.4B", seed: 7 },
  { symbol: "ETH", name: "Ethereum", price: 3_521.88, change24h: 3.12, marketCap: "$423B", volume: "$14.2B", seed: 13 },
  { symbol: "SOL", name: "Solana", price: 168.42, change24h: 5.78, marketCap: "$78B", volume: "$3.8B", seed: 21 },
  { symbol: "BNB", name: "BNB", price: 612.05, change24h: -1.21, marketCap: "$92B", volume: "$1.6B", seed: 33 },
  { symbol: "XRP", name: "XRP", price: 0.5421, change24h: -2.41, marketCap: "$30B", volume: "$1.2B", seed: 41 },
  { symbol: "ADA", name: "Cardano", price: 0.4612, change24h: 1.05, marketCap: "$16B", volume: "$420M", seed: 55 },
  { symbol: "DOGE", name: "Dogecoin", price: 0.1521, change24h: 4.22, marketCap: "$22B", volume: "$1.1B", seed: 67 },
  { symbol: "AVAX", name: "Avalanche", price: 36.71, change24h: -0.84, marketCap: "$14B", volume: "$380M", seed: 73 },
  { symbol: "LINK", name: "Chainlink", price: 14.92, change24h: 2.91, marketCap: "$8.7B", volume: "$310M", seed: 89 },
  { symbol: "MATIC", name: "Polygon", price: 0.6712, change24h: -3.12, marketCap: "$6.2B", volume: "$280M", seed: 95 },
];

export function formatPrice(n: number) {
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}
