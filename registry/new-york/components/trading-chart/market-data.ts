"use client";

import type {
  CandlestickData,
  HistogramData,
  LineData,
  UTCTimestamp,
} from "lightweight-charts";

export interface Timeframe {
  id: string;
  label: string;
  seconds: number;
}

export const TIMEFRAMES: Timeframe[] = [
  { id: "1m", label: "1m", seconds: 60 },
  { id: "5m", label: "5m", seconds: 300 },
  { id: "15m", label: "15m", seconds: 900 },
  { id: "1H", label: "1H", seconds: 3600 },
  { id: "4H", label: "4H", seconds: 14400 },
  { id: "1D", label: "1D", seconds: 86400 },
];

export const CANDLE_COUNT = 140;
export const MA_FAST_PERIOD = 9;
export const MA_SLOW_PERIOD = 21;

export const UP_COLOR = "#26a69a";
export const DOWN_COLOR = "#ef5350";

export interface OhlcvDataset {
  timeframe: Timeframe;
  candles: CandlestickData<UTCTimestamp>[];
  volumes: HistogramData<UTCTimestamp>[];
  maFast: LineData<UTCTimestamp>[];
  maSlow: LineData<UTCTimestamp>[];
}

function hashSeed(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Single-pass moving average with a running sum — O(n), no per-point
 * slice/reduce allocations. Matches the naive windowed definition exactly,
 * including the warm-up prefix (averages over fewer than `period` points).
 */
function movingAverage(
  closes: number[],
  times: UTCTimestamp[],
  period: number,
): LineData<UTCTimestamp>[] {
  const result: LineData<UTCTimestamp>[] = new Array(closes.length);
  let sum = 0;
  for (let index = 0; index < closes.length; index += 1) {
    sum += closes[index];
    if (index >= period) sum -= closes[index - period];
    result[index] = {
      time: times[index],
      value: sum / Math.min(index + 1, period),
    };
  }
  return result;
}

export function volumeBarColor(up: boolean): string {
  return up ? "rgba(38, 166, 154, 0.5)" : "rgba(239, 83, 80, 0.5)";
}

/** Assemble a dataset from candle + volume arrays (computes both MAs). */
export function buildDataset(
  timeframe: Timeframe,
  candles: CandlestickData<UTCTimestamp>[],
  volumes: HistogramData<UTCTimestamp>[],
): OhlcvDataset {
  const closes = candles.map((candle) => candle.close);
  const times = candles.map((candle) => candle.time);
  return {
    timeframe,
    candles,
    volumes,
    maFast: movingAverage(closes, times, MA_FAST_PERIOD),
    maSlow: movingAverage(closes, times, MA_SLOW_PERIOD),
  };
}

/**
 * Insert or replace the last candle of a mutable cache by time. Used to keep
 * a local candle list in step with streaming updates (same time replaces,
 * newer time appends). Out-of-order older ticks are ignored.
 */
export function upsertCandle(
  candles: CandlestickData<UTCTimestamp>[],
  candle: CandlestickData<UTCTimestamp>,
): void {
  const last = candles[candles.length - 1];
  if (!last || candle.time > last.time) {
    candles.push(candle);
    return;
  }
  if (candle.time === last.time) {
    candles[candles.length - 1] = candle;
  }
}

/** Average of up to the last `period` closes (fewer while warming up). */
export function movingTailAverage(closes: number[], period: number): number {
  const window = closes.slice(Math.max(0, closes.length - period));
  if (window.length === 0) return 0;
  return window.reduce((total, close) => total + close, 0) / window.length;
}

/**
 * Deterministic dummy OHLCV series: same (timeframe, anchor) always yields
 * the same candles (seeded PRNG + floored end time), so switching timeframes
 * back and forth is stable and unit-testable. Prices random-walk around a
 * BTC-like base with volume correlated to candle range.
 *
 * Pass an explicit `now` (ms) wherever repeatability matters — the default
 * `Date.now()` means two calls straddling a timeframe boundary return
 * different datasets. For UI call sites prefer `stableDummyDataset`, which
 * pins one anchor per timeframe for the whole session.
 */
export function generateOhlcv(
  timeframeId: string,
  now: number = Date.now(),
): OhlcvDataset {
  const timeframe =
    TIMEFRAMES.find((entry) => entry.id === timeframeId) ?? TIMEFRAMES[3];
  const random = mulberry32(hashSeed(`kick-ui-ohlcv-${timeframe.id}`));

  const endTime =
    Math.floor(now / 1000 / timeframe.seconds) * timeframe.seconds;
  const startTime = endTime - (CANDLE_COUNT - 1) * timeframe.seconds;

  const candles: CandlestickData<UTCTimestamp>[] = [];
  const volumes: HistogramData<UTCTimestamp>[] = [];

  let price = 67400 * (0.94 + random() * 0.12);
  const baseVolume = 42 + random() * 30;

  for (let index = 0; index < CANDLE_COUNT; index += 1) {
    const time = (startTime + index * timeframe.seconds) as UTCTimestamp;
    const volatility = price * 0.004 * Math.sqrt(timeframe.seconds / 60);
    const open = price;
    const change = (random() - 0.5) * volatility * 2;
    const close = Math.max(1, open + change);
    const high = Math.max(open, close) + random() * volatility * 0.6;
    const low = Math.max(
      1,
      Math.min(open, close) - random() * volatility * 0.6,
    );
    const up = close >= open;
    const volume =
      baseVolume *
      (0.4 + random() * 1.6) *
      (1 + (Math.abs(change) / volatility) * 0.8);

    candles.push({ time, open, high, low, close });
    volumes.push({
      time,
      value: Math.round(volume * 100) / 100,
      color: volumeBarColor(up),
    });
    price = close;
  }

  return buildDataset(timeframe, candles, volumes);
}

// Session-pinned anchors: at most one per known timeframe id.
const dummyAnchorCache = new Map<string, number>();

/**
 * Dummy dataset with a stable anchor per timeframe for the whole session.
 * Repeated calls (and timeframe switches) within one session always return
 * the same candles — the boundary-crossing flakiness of raw `Date.now()`
 * cannot occur. UI code should call this; tests should call `generateOhlcv`
 * with an explicit anchor.
 */
export function stableDummyDataset(timeframeId: string): OhlcvDataset {
  let anchor = dummyAnchorCache.get(timeframeId);
  if (anchor === undefined) {
    anchor = Date.now();
    dummyAnchorCache.set(timeframeId, anchor);
  }
  return generateOhlcv(timeframeId, anchor);
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

export function formatCompactVolume(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toFixed(2);
}
