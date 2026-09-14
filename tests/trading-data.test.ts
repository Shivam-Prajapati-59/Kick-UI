import { describe, expect, test } from "bun:test";
import {
  CANDLE_COUNT,
  formatCompactVolume,
  formatPrice,
  generateOhlcv,
  stableDummyDataset,
} from "../registry/new-york/components/trading-chart/market-data";

// Fixed ms anchor — every test below is fully deterministic, independent of
// wall-clock time and timeframe boundaries.
const ANCHOR = 1_700_000_000_000;

describe("generateOhlcv", () => {
  test("is deterministic for the same anchor", () => {
    expect(generateOhlcv("1H", ANCHOR)).toEqual(generateOhlcv("1H", ANCHOR));
  });

  test("anchors inside one bucket yield identical datasets", () => {
    // 1H buckets span 3600s; both anchors floor to the same end time.
    expect(generateOhlcv("1H", ANCHOR)).toEqual(
      generateOhlcv("1H", ANCHOR + 1_000_000),
    );
  });

  test("anchors across a bucket boundary shift the series by one interval", () => {
    const boundary = Math.floor(ANCHOR / 3_600_000) * 3_600_000;
    const before = generateOhlcv("1H", boundary - 1);
    const after = generateOhlcv("1H", boundary);
    expect(after.candles[after.candles.length - 1].time).toBe(
      before.candles[before.candles.length - 1].time + 3600,
    );
  });

  test("different timeframes yield different series", () => {
    const hourly = generateOhlcv("1H", ANCHOR);
    const daily = generateOhlcv("1D", ANCHOR);
    expect(hourly.candles).not.toEqual(daily.candles);
  });

  test("candles are well-formed and ascending", () => {
    const { candles, volumes, maFast, maSlow } = generateOhlcv("15m", ANCHOR);
    expect(candles).toHaveLength(CANDLE_COUNT);
    expect(volumes).toHaveLength(CANDLE_COUNT);
    expect(maFast).toHaveLength(CANDLE_COUNT);
    expect(maSlow).toHaveLength(CANDLE_COUNT);
    for (let index = 0; index < candles.length; index += 1) {
      const candle = candles[index];
      expect(candle.high).toBeGreaterThanOrEqual(
        Math.max(candle.open, candle.close),
      );
      expect(candle.low).toBeLessThanOrEqual(
        Math.min(candle.open, candle.close),
      );
      expect(volumes[index].value).toBeGreaterThan(0);
      expect(volumes[index].time).toBe(candle.time);
      if (index > 0) {
        expect(candle.time).toBeGreaterThan(candles[index - 1].time);
      }
    }
  });

  test("unknown timeframe falls back instead of throwing", () => {
    expect(generateOhlcv("nope", ANCHOR).candles).toHaveLength(CANDLE_COUNT);
  });

  test("stableDummyDataset pins one anchor per timeframe", () => {
    expect(stableDummyDataset("1H")).toEqual(stableDummyDataset("1H"));
  });
});

describe("trading formatters", () => {
  test("formatPrice keeps two decimals with grouping", () => {
    expect(formatPrice(67400.5)).toBe("67,400.50");
  });

  test("formatCompactVolume abbreviates large values", () => {
    expect(formatCompactVolume(1500)).toBe("1.50K");
    expect(formatCompactVolume(2_500_000)).toBe("2.50M");
    expect(formatCompactVolume(42.5)).toBe("42.50");
  });
});
