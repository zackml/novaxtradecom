import { useEffect, useRef } from "react";

interface Props {
  symbol?: string; // e.g. "BINANCE:BTCUSDT"
  height?: number;
  interval?: string;
}

// Embeds the official TradingView Advanced Chart widget.
// https://www.tradingview.com/widget/advanced-chart/
export function TradingViewWidget({
  symbol = "BINANCE:BTCUSDT",
  height = 480,
  interval = "60",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      backgroundColor: "rgba(13, 17, 23, 1)",
      gridColor: "rgba(60, 60, 80, 0.2)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [symbol, interval]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full overflow-hidden rounded-xl"
      style={{ height }}
    />
  );
}
