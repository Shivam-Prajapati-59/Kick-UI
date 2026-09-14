"use client";

import type {
  CandlestickData,
  HistogramData,
  UTCTimestamp,
} from "lightweight-charts";
import {
  CANDLE_COUNT,
  TIMEFRAMES,
  buildDataset,
  volumeBarColor,
  type OhlcvDataset,
} from "./market-data";

export const FEED_SYMBOL = "BTCUSDT";
const REST_BASE = "https://data-api.binance.vision";
const WS_BASE = "wss://data-stream.binance.vision";

const INTERVALS: Record<string, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "1H": "1h",
  "4H": "4h",
  "1D": "1d",
};

export function intervalFor(timeframeId: string): string | null {
  return INTERVALS[timeframeId] ?? null;
}

export function klineStreamUrl(timeframeId: string): string | null {
  const interval = intervalFor(timeframeId);
  if (!interval) return null;
  return `${WS_BASE}/ws/${FEED_SYMBOL.toLowerCase()}@kline_${interval}`;
}

export interface KlineTick {
  candle: CandlestickData<UTCTimestamp>;
  volume: HistogramData<UTCTimestamp>;
  isClosed: boolean;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "string" && value.trim() === "") return null;
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}

/**
 * Parse a `kline` websocket event into a chart tick. Returns null for
 * anything unexpected so a malformed message can never corrupt the series.
 */
export function parseKlineTick(message: unknown): KlineTick | null {
  if (typeof message !== "object" || message === null) return null;
  const event = (message as { e?: unknown }).e;
  const raw = (message as { k?: unknown }).k;
  if (event !== "kline" || typeof raw !== "object" || raw === null) return null;
  const k = raw as Record<string, unknown>;

  const openTime = toFiniteNumber(k.t);
  const open = toFiniteNumber(k.o);
  const high = toFiniteNumber(k.h);
  const low = toFiniteNumber(k.l);
  const close = toFiniteNumber(k.c);
  const volume = toFiniteNumber(k.v);
  if (
    openTime == null ||
    open == null ||
    high == null ||
    low == null ||
    close == null ||
    volume == null
  ) {
    return null;
  }

  const time = Math.floor(openTime / 1000) as UTCTimestamp;
  const up = close >= open;
  return {
    candle: { time, open, high, low, close },
    volume: { time, value: volume, color: volumeBarColor(up) },
    isClosed: k.x === true,
  };
}

type KlineRow = [number, string, string, string, string, string, ...unknown[]];

function parseKlineRow(row: unknown): {
  candle: CandlestickData<UTCTimestamp>;
  volume: HistogramData<UTCTimestamp>;
} | null {
  if (!Array.isArray(row) || row.length < 7) return null;
  const [openTime, openRaw, highRaw, lowRaw, closeRaw, volumeRaw] =
    row as KlineRow;
  const open = toFiniteNumber(openRaw);
  const high = toFiniteNumber(highRaw);
  const low = toFiniteNumber(lowRaw);
  const close = toFiniteNumber(closeRaw);
  const volume = toFiniteNumber(volumeRaw);
  if (
    typeof openTime !== "number" ||
    !Number.isFinite(openTime) ||
    open == null ||
    high == null ||
    low == null ||
    close == null ||
    volume == null
  ) {
    return null;
  }
  const time = Math.floor(openTime / 1000) as UTCTimestamp;
  const up = close >= open;
  return {
    candle: { time, open, high, low, close },
    volume: { time, value: volume, color: volumeBarColor(up) },
  };
}

/** Map raw `/klines` rows to a dataset. Pure — unit-tested, no network. */
export function mapKlinesToDataset(
  timeframeId: string,
  rows: unknown,
): OhlcvDataset {
  const timeframe =
    TIMEFRAMES.find((entry) => entry.id === timeframeId) ?? TIMEFRAMES[3];
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Empty kline response");
  }
  const candles: CandlestickData<UTCTimestamp>[] = [];
  const volumes: HistogramData<UTCTimestamp>[] = [];
  for (const row of rows) {
    const parsed = parseKlineRow(row);
    if (!parsed) throw new Error("Malformed kline row");
    candles.push(parsed.candle);
    volumes.push(parsed.volume);
  }
  return buildDataset(timeframe, candles, volumes);
}

/**
 * Fetch recent klines for a timeframe. Throws on any failure so callers can
 * fall back to the local simulator.
 */
export async function fetchHistory(
  timeframeId: string,
  signal: AbortSignal,
): Promise<OhlcvDataset> {
  const interval = intervalFor(timeframeId);
  if (!interval) throw new Error(`Unsupported timeframe: ${timeframeId}`);
  const response = await fetch(
    `${REST_BASE}/api/v3/klines?symbol=${FEED_SYMBOL}&interval=${interval}&limit=${CANDLE_COUNT}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Klines request failed: ${response.status}`);
  }
  return mapKlinesToDataset(timeframeId, await response.json());
}

export interface KlineSubscription {
  onTick: (tick: KlineTick) => void;
  onDisconnect: () => void;
}

/**
 * Open a kline websocket for a timeframe. Returns an unsubscribe function.
 * Reconnection policy is left to the caller.
 */
export function subscribeKlines(
  timeframeId: string,
  subscription: KlineSubscription,
): () => void {
  const url = klineStreamUrl(timeframeId);
  if (!url) throw new Error(`Unsupported timeframe: ${timeframeId}`);
  const socket = new WebSocket(url);
  let closed = false;

  socket.onmessage = (event: MessageEvent) => {
    try {
      const tick = parseKlineTick(JSON.parse(event.data));
      if (tick) subscription.onTick(tick);
    } catch {
      // Ignore malformed frames; the next tick repairs nothing to repair.
    }
  };
  socket.onclose = () => {
    if (!closed) subscription.onDisconnect();
  };
  socket.onerror = () => {
    // onclose follows error; report disconnect once via the close path.
    try {
      socket.close();
    } catch {
      // Already closing — nothing to do.
    }
  };

  return () => {
    closed = true;
    try {
      socket.close();
    } catch {
      // Already closed — nothing to do.
    }
  };
}
