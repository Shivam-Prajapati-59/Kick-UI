import { describe, expect, test } from "bun:test";
import type { UTCTimestamp } from "lightweight-charts";
import {
  DRAW_COLOR,
  FIB_LEVELS,
  distToSegment,
  fibPrice,
  hitTestDrawing,
  type Drawing,
  type PixelConverters,
} from "../registry/new-york/components/trading-chart/drawings";

const T = (n: number): UTCTimestamp => n as UTCTimestamp;

// Identity converters: 1 time unit = 1px, 1 price unit = 1px.
const converters: PixelConverters = {
  toX: (time) => time,
  toY: (price) => price,
};

describe("distToSegment", () => {
  test("zero for a point on the segment", () => {
    expect(distToSegment(5, 0, 0, 0, 10, 0)).toBe(0);
  });

  test("perpendicular distance to a horizontal segment", () => {
    expect(distToSegment(5, 3, 0, 0, 10, 0)).toBe(3);
  });

  test("clamps to endpoints beyond the segment", () => {
    expect(distToSegment(15, 0, 0, 0, 10, 0)).toBe(5);
  });

  test("degenerate zero-length segment measures to the point", () => {
    expect(distToSegment(3, 4, 0, 0, 0, 0)).toBe(5);
  });
});

describe("fibPrice", () => {
  test("interpolates between anchors", () => {
    const p1 = { time: T(0), price: 100 };
    const p2 = { time: T(10), price: 200 };
    expect(fibPrice(p1, p2, 0)).toBe(100);
    expect(fibPrice(p1, p2, 0.5)).toBe(150);
    expect(fibPrice(p1, p2, 1)).toBe(200);
  });
});

describe("FIB_LEVELS", () => {
  test("covers the standard retracement set", () => {
    expect(FIB_LEVELS).toEqual([0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]);
  });
});

describe("hitTestDrawing", () => {
  test("trend line hits near the segment, misses far away", () => {
    const drawing: Drawing = {
      id: 1,
      kind: "trend",
      p1: { time: T(0), price: 0 },
      p2: { time: T(10), price: 0 },
      color: DRAW_COLOR,
    };
    expect(hitTestDrawing(drawing, 5, 2, converters)).toBe(true);
    expect(hitTestDrawing(drawing, 5, 50, converters)).toBe(false);
  });

  test("horizontal line spans the full width", () => {
    const drawing: Drawing = {
      id: 1,
      kind: "horizontal",
      price: 100,
      color: DRAW_COLOR,
    };
    expect(hitTestDrawing(drawing, 9999, 102, converters)).toBe(true);
    expect(hitTestDrawing(drawing, 0, 200, converters)).toBe(false);
  });

  test("vertical line spans the full height", () => {
    const drawing: Drawing = {
      id: 1,
      kind: "vertical",
      time: T(50),
      color: DRAW_COLOR,
    };
    expect(hitTestDrawing(drawing, 52, 9999, converters)).toBe(true);
    expect(hitTestDrawing(drawing, 100, 0, converters)).toBe(false);
  });

  test("rectangle hits inside, misses outside", () => {
    const drawing: Drawing = {
      id: 1,
      kind: "rectangle",
      p1: { time: T(10), price: 10 },
      p2: { time: T(20), price: 20 },
      color: DRAW_COLOR,
    };
    expect(hitTestDrawing(drawing, 15, 15, converters)).toBe(true);
    expect(hitTestDrawing(drawing, 0, 0, converters)).toBe(false);
  });

  test("fib hits on a level line right of the anchors", () => {
    const drawing: Drawing = {
      id: 1,
      kind: "fib",
      p1: { time: T(0), price: 0 },
      p2: { time: T(10), price: 100 },
      color: DRAW_COLOR,
    };
    // 50% level at price 50, extended right past x=10.
    expect(hitTestDrawing(drawing, 500, 50, converters)).toBe(true);
    // 90 sits between the 78.6 and 100 levels, outside tolerance of both.
    expect(hitTestDrawing(drawing, 500, 90, converters)).toBe(false);
  });

  test("brush hits near a stroke segment", () => {
    const drawing: Drawing = {
      id: 1,
      kind: "brush",
      points: [
        { time: T(0), price: 0 },
        { time: T(10), price: 10 },
      ],
      color: DRAW_COLOR,
    };
    expect(hitTestDrawing(drawing, 5, 5, converters)).toBe(true);
    expect(hitTestDrawing(drawing, 5, 50, converters)).toBe(false);
  });

  test("off-scale coordinates are a miss, not a crash", () => {
    const drawing: Drawing = {
      id: 1,
      kind: "trend",
      p1: { time: T(0), price: 0 },
      p2: { time: T(10), price: 10 },
      color: DRAW_COLOR,
    };
    const nullish: PixelConverters = {
      toX: () => null,
      toY: () => null,
    };
    expect(hitTestDrawing(drawing, 5, 5, nullish)).toBe(false);
  });
});
