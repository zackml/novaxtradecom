import { useMemo } from "react";

interface FakeChartProps {
  seed?: number;
  points?: number;
  height?: number;
  bullish?: boolean;
  showGrid?: boolean;
  showArea?: boolean;
  className?: string;
}

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function FakeLineChart({
  seed = 7,
  points = 80,
  height = 280,
  bullish = true,
  showGrid = true,
  showArea = true,
  className,
}: FakeChartProps) {
  const { path, area } = useMemo(() => {
    const r = rand(seed);
    const vals: number[] = [];
    let v = 50;
    for (let i = 0; i < points; i++) {
      const drift = bullish ? 0.35 : -0.35;
      v += (r() - 0.5) * 8 + drift;
      vals.push(v);
    }
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const w = 800;
    const h = height;
    const norm = (n: number) => h - ((n - min) / (max - min || 1)) * (h - 20) - 10;
    const step = w / (points - 1);
    const path = vals.map((n, i) => `${i === 0 ? "M" : "L"}${i * step},${norm(n)}`).join(" ");
    const area = `${path} L${w},${h} L0,${h} Z`;
    return { path, area };
  }, [seed, points, height, bullish]);

  const stroke = bullish ? "var(--success)" : "var(--destructive)";
  const gid = `grad-${seed}-${bullish ? 1 : 0}`;

  return (
    <svg
      viewBox={`0 0 800 ${height}`}
      preserveAspectRatio="none"
      className={`w-full ${className ?? ""}`}
      style={{ height }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.5" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showGrid && (
        <g stroke="currentColor" opacity="0.06">
          {[0.2, 0.4, 0.6, 0.8].map((p) => (
            <line key={p} x1="0" x2="800" y1={height * p} y2={height * p} />
          ))}
        </g>
      )}
      {showArea && <path d={area} fill={`url(#${gid})`} />}
      <path d={path} stroke={stroke} strokeWidth="2" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

export function FakeCandleChart({
  seed = 11,
  count = 60,
  height = 360,
}: {
  seed?: number;
  count?: number;
  height?: number;
}) {
  const candles = useMemo(() => {
    const r = rand(seed);
    let price = 100;
    return Array.from({ length: count }).map(() => {
      const open = price;
      const close = open + (r() - 0.48) * 6;
      const high = Math.max(open, close) + r() * 3;
      const low = Math.min(open, close) - r() * 3;
      price = close;
      return { open, close, high, low };
    });
  }, [seed, count]);

  const min = Math.min(...candles.map((c) => c.low));
  const max = Math.max(...candles.map((c) => c.high));
  const w = 800;
  const cw = w / count;
  const norm = (n: number) => height - ((n - min) / (max - min || 1)) * (height - 24) - 12;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <g stroke="currentColor" opacity="0.06">
        {[0.15, 0.35, 0.55, 0.75, 0.95].map((p) => (
          <line key={p} x1="0" x2={w} y1={height * p} y2={height * p} />
        ))}
      </g>
      {candles.map((c, i) => {
        const up = c.close >= c.open;
        const color = up ? "var(--success)" : "var(--destructive)";
        const x = i * cw + cw / 2;
        const bodyTop = norm(Math.max(c.open, c.close));
        const bodyH = Math.max(1, Math.abs(norm(c.open) - norm(c.close)));
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={norm(c.high)} y2={norm(c.low)} stroke={color} strokeWidth="1" />
            <rect
              x={i * cw + 1}
              y={bodyTop}
              width={Math.max(2, cw - 2)}
              height={bodyH}
              fill={color}
              opacity={up ? 0.9 : 0.85}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function Sparkline({ seed = 3, bullish = true }: { seed?: number; bullish?: boolean }) {
  return <FakeLineChart seed={seed} points={30} height={40} bullish={bullish} showGrid={false} showArea={false} />;
}
