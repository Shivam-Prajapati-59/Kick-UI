"use client";

import type { UTCTimestamp } from "lightweight-charts";

export type DrawingTool =
  | "cursor"
  | "trend"
  | "horizontal"
  | "vertical"
  | "rectangle"
  | "fib"
  | "brush"
  | "eraser";

export interface DrawingAnchor {
  time: UTCTimestamp;
  price: number;
}

export interface TrendDrawing {
  id: number;
  kind: "trend";
  p1: DrawingAnchor;
  p2: DrawingAnchor;
  color: string;
}

export interface HorizontalDrawing {
  id: number;
  kind: "horizontal";
  price: number;
  color: string;
}

export interface VerticalDrawing {
  id: number;
  kind: "vertical";
  time: UTCTimestamp;
  color: string;
}

export interface RectangleDrawing {
  id: number;
  kind: "rectangle";
  p1: DrawingAnchor;
  p2: DrawingAnchor;
  color: string;
}

export interface FibDrawing {
  id: number;
  kind: "fib";
  p1: DrawingAnchor;
  p2: DrawingAnchor;
  color: string;
}

export interface BrushDrawing {
  id: number;
  kind: "brush";
  points: DrawingAnchor[];
  color: string;
}

export type Drawing =
  | TrendDrawing
  | HorizontalDrawing
  | VerticalDrawing
  | RectangleDrawing
  | FibDrawing
  | BrushDrawing;

export const DRAW_COLOR = "#38bdf8";

export const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

export function fibPrice(
  p1: DrawingAnchor,
  p2: DrawingAnchor,
  level: number,
): number {
  return p1.price + (p2.price - p1.price) * level;
}

/** Shortest distance from point (px, py) to segment a→b, in the same units. */
export function distToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export interface PixelConverters {
  toX: (time: UTCTimestamp) => number | null;
  toY: (price: number) => number | null;
}

/**
 * Hit-test a drawing against a media-space point. Used by the eraser tool
 * (click a drawing to delete it). Returns true when the point is on the
 * drawing within `tolerance` pixels.
 */
export function hitTestDrawing(
  drawing: Drawing,
  x: number,
  y: number,
  converters: PixelConverters,
  tolerance = 6,
): boolean {
  const { toX, toY } = converters;
  switch (drawing.kind) {
    case "trend": {
      const x1 = toX(drawing.p1.time);
      const y1 = toY(drawing.p1.price);
      const x2 = toX(drawing.p2.time);
      const y2 = toY(drawing.p2.price);
      if (x1 == null || y1 == null || x2 == null || y2 == null) return false;
      return distToSegment(x, y, x1, y1, x2, y2) <= tolerance;
    }
    case "horizontal": {
      const ly = toY(drawing.price);
      if (ly == null) return false;
      return Math.abs(y - ly) <= tolerance;
    }
    case "vertical": {
      const lx = toX(drawing.time);
      if (lx == null) return false;
      return Math.abs(x - lx) <= tolerance;
    }
    case "rectangle": {
      const x1 = toX(drawing.p1.time);
      const y1 = toY(drawing.p1.price);
      const x2 = toX(drawing.p2.time);
      const y2 = toY(drawing.p2.price);
      if (x1 == null || y1 == null || x2 == null || y2 == null) return false;
      return (
        x >= Math.min(x1, x2) - tolerance &&
        x <= Math.max(x1, x2) + tolerance &&
        y >= Math.min(y1, y2) - tolerance &&
        y <= Math.max(y1, y2) + tolerance
      );
    }
    case "fib": {
      const x1 = toX(drawing.p1.time);
      const x2 = toX(drawing.p2.time);
      if (x1 == null || x2 == null) return false;
      // Levels render from the left anchor edge extending right.
      if (x < Math.min(x1, x2) - tolerance) return false;
      return FIB_LEVELS.some((level) => {
        const ly = toY(fibPrice(drawing.p1, drawing.p2, level));
        return ly != null && Math.abs(y - ly) <= tolerance;
      });
    }
    case "brush": {
      const pts = drawing.points;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const x1 = toX(prev.time);
        const y1 = toY(prev.price);
        const x2 = toX(curr.time);
        const y2 = toY(curr.price);
        if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
        if (distToSegment(x, y, x1, y1, x2, y2) <= tolerance) return true;
      }
      return false;
    }
  }
}
