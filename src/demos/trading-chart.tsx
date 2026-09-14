"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CandlestickData,
  HistogramData,
  UTCTimestamp,
} from "lightweight-charts";
import {
  TradingChart,
  type Drawing,
  type TradingFeedStatus,
} from "@registry/new-york/components/trading-chart/trading-chart";
import {
  fetchHistory,
  subscribeKlines,
} from "@registry/new-york/components/trading-chart/live-feed";
import type { OhlcvDataset } from "@registry/new-york/components/trading-chart/market-data";

interface LiveBar {
  candle: CandlestickData<UTCTimestamp>;
  volume: HistogramData<UTCTimestamp>;
}

function upsert<T extends { time: UTCTimestamp }>(list: T[], entry: T): T[] {
  const last = list[list.length - 1];
  if (!last || entry.time > last.time) return [...list, entry];
  if (entry.time === last.time) return [...list.slice(0, -1), entry];
  return list;
}

/**
 * Same footprint as the loaded panel (header + legend + rail + 380px chart
 * area) so loading/error states never shift the layout. Only the chart
 * area content differs.
 */
function ChartShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className="border-border bg-card w-full overflow-hidden rounded-xl border"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 pb-0">
        <div className="flex items-center gap-2">
          <span className="bg-muted h-6 w-6 animate-pulse rounded-full" />
          <span className="bg-muted h-7 w-32 animate-pulse rounded-md" />
        </div>
        <span className="bg-muted h-8 w-40 animate-pulse rounded-md" />
        <div className="ml-auto flex items-center gap-1 py-1">
          {["1m", "5m", "15m", "1H", "4H", "1D"].map((pill) => (
            <span
              key={pill}
              className="bg-muted h-8 w-11 animate-pulse rounded-md"
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 px-4 pt-2">
        <span className="bg-muted h-4 w-20 animate-pulse rounded" />
        <span className="bg-muted h-4 w-20 animate-pulse rounded" />
        <span className="bg-muted h-4 w-20 animate-pulse rounded" />
        <span className="bg-muted h-4 w-24 animate-pulse rounded" />
      </div>
      <div className="flex">
        <div className="flex flex-col items-center gap-1 px-2 py-3">
          {Array.from({ length: 8 }, (_, index) => (
            <span
              key={index}
              className="bg-muted h-8 w-8 animate-pulse rounded-md"
            />
          ))}
          <div className="mt-auto flex flex-col items-center gap-1 pt-2">
            <span className="bg-muted h-8 w-8 animate-pulse rounded-md" />
            <span className="bg-muted h-8 w-8 animate-pulse rounded-md" />
          </div>
        </div>
        <span
          aria-hidden="true"
          className="bg-border my-3 w-px shrink-0 self-stretch"
        />
        <div className="min-w-0 flex-1 p-2">
          <div className="bg-muted/40 flex h-[380px] w-full flex-col items-center justify-center gap-3 rounded-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Live demo: streams real BTC/USDT klines from Binance (REST history +
 * websocket with indefinite reconnect). No simulated data — a same-size
 * loader shows until the first history arrives, and an error state with
 * retry shows when history cannot be fetched at all.
 */
export default function TradingChartDemo() {
  const [timeframeId, setTimeframeId] = useState("1H");
  const [base, setBase] = useState<OhlcvDataset | null>(null);
  const [liveBar, setLiveBar] = useState<LiveBar | null>(null);
  const [feedStatus, setFeedStatus] = useState<TradingFeedStatus>("connecting");
  const [failed, setFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [drawingsByTf, setDrawingsByTf] = useState<Record<string, Drawing[]>>(
    {},
  );
  const liveBarRef = useRef<LiveBar | null>(null);

  const candles =
    base == null
      ? []
      : liveBar != null
        ? upsert(base.candles, liveBar.candle)
        : base.candles;
  const volumes =
    base == null || base.volumes.length === 0
      ? []
      : liveBar != null
        ? upsert(base.volumes, liveBar.volume)
        : base.volumes;

  const resetLive = () => {
    liveBarRef.current = null;
    setLiveBar(null);
  };

  const switchTimeframe = (id: string) => {
    if (id === timeframeId) return;
    setBase(null);
    resetLive();
    setFailed(false);
    setFeedStatus("connecting");
    setTimeframeId(id);
  };

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;

    const pushTick = (
      candle: CandlestickData<UTCTimestamp>,
      volume: HistogramData<UTCTimestamp>,
    ) => {
      if (cancelled) return;
      const prevLive = liveBarRef.current;
      if (prevLive && prevLive.candle.time < candle.time) {
        // New interval: fold the finalized bar into history so its live
        // values are kept instead of snapping back to the fetched ones.
        const finalized = prevLive;
        setBase((prevDataset) => {
          if (!prevDataset) return prevDataset;
          return {
            ...prevDataset,
            candles: upsert(prevDataset.candles, finalized.candle),
            volumes: upsert(prevDataset.volumes, finalized.volume),
          };
        });
      }
      const next = { candle, volume };
      liveBarRef.current = next;
      setLiveBar(next);
    };

    const connect = () => {
      if (cancelled) return;
      try {
        unsubscribe = subscribeKlines(timeframeId, {
          onTick: (tick) => {
            if (cancelled) return;
            attempt = 0;
            setFeedStatus("live");
            pushTick(tick.candle, tick.volume);
          },
          onDisconnect: () => {
            if (cancelled) return;
            unsubscribe = null;
            // Reconnect forever with capped backoff; the last dataset stays
            // visible (frozen) with a connecting dot meanwhile.
            setFeedStatus("connecting");
            const delay = Math.min(2000 * 2 ** attempt, 30000);
            attempt += 1;
            retryTimer = setTimeout(connect, delay);
          },
        });
      } catch {
        setFeedStatus("connecting");
        retryTimer = setTimeout(connect, 2000);
      }
    };

    const controller = new AbortController();
    fetchHistory(timeframeId, controller.signal)
      .then((real) => {
        if (cancelled) return;
        setBase(real);
        resetLive();
        connect();
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      controller.abort();
      if (retryTimer) clearTimeout(retryTimer);
      unsubscribe?.();
    };
  }, [timeframeId, retryCount]);

  if (failed && base == null) {
    return (
      <ChartShell label="Chart failed to load">
        <p className="text-sm font-medium">Couldn&apos;t load live data</p>
        <p className="text-muted-foreground max-w-sm px-4 text-center text-xs">
          The market-data feed is unreachable. Check your connection and try
          again.
        </p>
        <button
          type="button"
          onClick={() => {
            setFailed(false);
            setFeedStatus("connecting");
            setRetryCount((count) => count + 1);
          }}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-4 py-1.5 font-mono text-xs transition-colors"
        >
          Retry
        </button>
      </ChartShell>
    );
  }

  if (base == null) {
    return (
      <ChartShell label="Loading chart">
        <span className="border-muted-foreground/30 border-t-foreground h-5 w-5 animate-spin rounded-full border-2" />
        <p className="text-muted-foreground font-mono text-xs">
          Connecting to live feed…
        </p>
      </ChartShell>
    );
  }

  return (
    <TradingChart
      candles={candles}
      volumes={volumes}
      dataKey={`${timeframeId}:${base.candles[0]?.time ?? 0}`}
      symbol="BTC"
      quote="USD"
      logoSrc="https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
      activeTimeframe={timeframeId}
      onTimeframeChange={switchTimeframe}
      feedStatus={feedStatus}
      drawings={drawingsByTf[timeframeId] ?? []}
      onDrawingsChange={(next) =>
        setDrawingsByTf((prev) => ({ ...prev, [timeframeId]: next }))
      }
    />
  );
}
