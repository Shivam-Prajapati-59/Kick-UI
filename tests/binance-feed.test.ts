import { describe, expect, test } from "bun:test";
import type {
  CandlestickData,
  HistogramData,
  UTCTimestamp,
} from "lightweight-charts";
import {
  intervalFor,
  klineStreamUrl,
  mapKlinesToDataset,
  parseKlineTick,
} from "../registry/new-york/components/trading-chart/live-feed";
import {
  buildDataset,
  movingTailAverage,
  upsertCandle,
  volumeBarColor,
} from "../registry/new-york/components/trading-chart/market-data";

const T = (n: number): UTCTimestamp => n as UTCTimestamp;

function candle(time: number, close: number): CandlestickData<UTCTimestamp> {
  return { time: T(time), open: close, high: close + 1, low: close - 1, close };
}

describe("intervalFor / klineStreamUrl", () => {
  test("maps every timeframe tab to a Binance interval", () => {
    for (const id of ["1m", "5m", "15m", "1H", "4H", "1D"]) {
      expect(intervalFor(id)).not.toBe(null);
      expect(klineStreamUrl(id)).toContain("binance.vision");
    }
  });

  test("rejects unknown timeframes", () => {
    expect(intervalFor("nope")).toBe(null);
    expect(klineStreamUrl("nope")).toBe(null);
  });
});

describe("parseKlineTick", () => {
  const message = {
    e: "kline",
    k: {
      t: 1_700_000_000_000,
      o: "67000.00",
      h: "67100.00",
      l: "66900.00",
      c: "67050.00",
      v: "12.345",
      x: false,
    },
  };

  test("parses a kline event", () => {
    const tick = parseKlineTick(message);
    expect(tick).not.toBe(null);
    expect(tick?.candle).toEqual({
      time: 1_700_000_000,
      open: 67000,
      high: 67100,
      low: 66900,
      close: 67050,
    });
    expect(tick?.volume.value).toBe(12.345);
    expect(tick?.isClosed).toBe(false);
  });

  test("colors volume by candle direction", () => {
    const up = parseKlineTick(message)?.volume.color;
    const down = parseKlineTick({
      e: "kline",
      k: { ...message.k, c: "66950.00", x: true },
    });
    expect(up).toBe(volumeBarColor(true));
    expect(down?.volume.color).toBe(volumeBarColor(false));
    expect(down?.isClosed).toBe(true);
  });

  test("rejects malformed messages", () => {
    expect(parseKlineTick(null)).toBe(null);
    expect(parseKlineTick({ e: "trade", k: message.k })).toBe(null);
    expect(parseKlineTick({ e: "kline" })).toBe(null);
    expect(parseKlineTick({ e: "kline", k: { ...message.k, c: "oops" } })).toBe(
      null,
    );
  });
});

describe("mapKlinesToDataset", () => {
  const rows = [
    [
      1_700_000_000_000,
      "67000",
      "67100",
      "66900",
      "67050",
      "12.5",
      1_700_000_359_999,
      "837500",
      120,
      "6.1",
      "408000",
      "0",
    ],
    [
      1_700_000_360_000,
      "67050",
      "67200",
      "67000",
      "67150",
      "9.25",
      1_700_000_719_999,
      "621000",
      98,
      "4.4",
      "295000",
      "0",
    ],
  ];

  test("maps REST rows to candles, volumes, and MAs", () => {
    const dataset = mapKlinesToDataset("1H", rows);
    expect(dataset.timeframe.id).toBe("1H");
    expect(dataset.candles).toHaveLength(2);
    expect(dataset.candles[0]).toEqual({
      time: 1_700_000_000,
      open: 67000,
      high: 67100,
      low: 66900,
      close: 67050,
    });
    expect(dataset.volumes[1].value).toBe(9.25);
    expect(dataset.maFast).toHaveLength(2);
    expect(dataset.maSlow).toHaveLength(2);
  });

  test("throws on empty or malformed payloads", () => {
    expect(() => mapKlinesToDataset("1H", [])).toThrow();
    expect(() => mapKlinesToDataset("1H", [["short"]])).toThrow();
    expect(() => mapKlinesToDataset("1H", null)).toThrow();
  });
});

describe("upsertCandle", () => {
  test("replaces the candle with the same time", () => {
    const list = [candle(1, 100), candle(2, 101)];
    upsertCandle(list, candle(2, 105));
    expect(list).toHaveLength(2);
    expect(list[1].close).toBe(105);
  });

  test("appends newer candles and ignores older ones", () => {
    const list = [candle(2, 101)];
    upsertCandle(list, candle(3, 102));
    upsertCandle(list, candle(1, 99));
    expect(list.map((entry) => entry.time)).toEqual([T(2), T(3)]);
  });
});

describe("movingTailAverage", () => {
  test("averages the trailing window", () => {
    expect(movingTailAverage([10, 20, 30], 2)).toBe(25);
    expect(movingTailAverage([10, 20], 9)).toBe(15);
    expect(movingTailAverage([], 9)).toBe(0);
  });
});

describe("buildDataset", () => {
  test("derives both MAs from the candles", () => {
    const candles = [candle(1, 10), candle(2, 20), candle(3, 30)];
    const volumes: HistogramData<UTCTimestamp>[] = candles.map((entry) => ({
      time: entry.time,
      value: 1,
    }));
    const dataset = buildDataset(
      { id: "1m", label: "1m", seconds: 60 },
      candles,
      volumes,
    );
    expect(dataset.maFast.map((point) => point.value)).toEqual([10, 15, 20]);
    expect(dataset.maSlow.map((point) => point.value)).toEqual([10, 15, 20]);
  });
});
