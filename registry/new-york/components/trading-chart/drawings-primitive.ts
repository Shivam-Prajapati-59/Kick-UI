"use client";

import type {
  IChartApiBase,
  IPrimitivePaneView,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesAttachedParameter,
  SeriesType,
  Time,
  UTCTimestamp,
} from "lightweight-charts";
import {
  FIB_LEVELS,
  fibPrice,
  type Drawing,
  type DrawingAnchor,
} from "./drawings";

const priceFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

/**
 * Series primitive that renders user drawings (trend lines, horizontal /
 * vertical lines, rectangles, fib retracements, freehand brush strokes) on
 * top of the candles series, plus a dashed in-progress preview.
 */
export class DrawingsPrimitive implements ISeriesPrimitive<Time> {
  private chart: IChartApiBase<Time> | null = null;
  private series: ISeriesApi<SeriesType, Time> | null = null;
  private requestUpdateFn: (() => void) | null = null;
  private drawings: Drawing[] = [];
  private preview: Drawing | null = null;

  attached(param: SeriesAttachedParameter<Time, SeriesType>): void {
    this.chart = param.chart;
    this.series = param.series;
    this.requestUpdateFn = param.requestUpdate;
  }

  detached(): void {
    this.chart = null;
    this.series = null;
    this.requestUpdateFn = null;
  }

  setDrawings(drawings: Drawing[]): void {
    this.drawings = drawings;
    this.requestUpdateFn?.();
  }

  setPreview(preview: Drawing | null): void {
    this.preview = preview;
    this.requestUpdateFn?.();
  }

  paneViews(): readonly IPrimitivePaneView[] {
    return [
      {
        zOrder: () => "top",
        renderer: () => ({
          // `target` and `scope` are contextually typed by the interfaces
          // above; the concrete canvas-target type is intentionally not
          // imported because the package does not export it.
          draw: (target) => {
            const chart = this.chart;
            const series = this.series;
            if (!chart || !series) return;
            const all = this.preview
              ? [...this.drawings, this.preview]
              : this.drawings;
            if (all.length === 0) return;

            target.useBitmapCoordinateSpace((scope) => {
              const {
                context: ctx,
                horizontalPixelRatio,
                verticalPixelRatio,
                bitmapSize,
              } = scope;
              const ratio = (horizontalPixelRatio + verticalPixelRatio) / 2;
              const toX = (time: UTCTimestamp): number | null => {
                const c = chart.timeScale().timeToCoordinate(time);
                return c == null ? null : c * horizontalPixelRatio;
              };
              const toY = (price: number): number | null => {
                const c = series.priceToCoordinate(price);
                return c == null ? null : c * verticalPixelRatio;
              };
              all.forEach((drawing, index) => {
                const isPreview =
                  this.preview != null && index === all.length - 1;
                this.drawOne(
                  ctx,
                  drawing,
                  toX,
                  toY,
                  bitmapSize.width,
                  bitmapSize.height,
                  ratio,
                  isPreview,
                );
              });
            });
          },
        }),
      },
    ];
  }

  private drawOne(
    ctx: CanvasRenderingContext2D,
    drawing: Drawing,
    toX: (time: UTCTimestamp) => number | null,
    toY: (price: number) => number | null,
    width: number,
    height: number,
    ratio: number,
    isPreview: boolean,
  ): void {
    ctx.save();
    if (isPreview) {
      ctx.globalAlpha = 0.85;
      ctx.setLineDash([6 * ratio, 5 * ratio]);
    }
    switch (drawing.kind) {
      case "trend":
        this.drawTrend(
          ctx,
          toX,
          toY,
          drawing.p1,
          drawing.p2,
          drawing.color,
          ratio,
        );
        break;
      case "horizontal": {
        const y = toY(drawing.price);
        if (y != null) {
          this.strokeLine(
            ctx,
            0,
            y,
            width,
            y,
            drawing.color,
            Math.max(1, 1.5 * ratio),
          );
        }
        break;
      }
      case "vertical": {
        const x = toX(drawing.time);
        if (x != null) {
          this.strokeLine(
            ctx,
            x,
            0,
            x,
            height,
            drawing.color,
            Math.max(1, 1.5 * ratio),
          );
        }
        break;
      }
      case "rectangle":
        this.drawRectangle(
          ctx,
          toX,
          toY,
          drawing.p1,
          drawing.p2,
          drawing.color,
          ratio,
        );
        break;
      case "fib":
        this.drawFib(
          ctx,
          toX,
          toY,
          width,
          drawing.p1,
          drawing.p2,
          drawing.color,
          ratio,
        );
        break;
      case "brush":
        this.drawBrush(ctx, toX, toY, drawing.points, drawing.color, ratio);
        break;
    }
    ctx.restore();
  }

  private strokeLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    lineWidth: number,
  ): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  private drawTrend(
    ctx: CanvasRenderingContext2D,
    toX: (time: UTCTimestamp) => number | null,
    toY: (price: number) => number | null,
    p1: DrawingAnchor,
    p2: DrawingAnchor,
    color: string,
    ratio: number,
  ): void {
    const x1 = toX(p1.time);
    const y1 = toY(p1.price);
    const x2 = toX(p2.time);
    const y2 = toY(p2.price);
    if (x1 == null || y1 == null || x2 == null || y2 == null) return;
    this.strokeLine(ctx, x1, y1, x2, y2, color, Math.max(1.5, 2 * ratio));
    ctx.fillStyle = color;
    for (const [x, y] of [
      [x1, y1],
      [x2, y2],
    ] as const) {
      ctx.beginPath();
      ctx.arc(x, y, 3 * ratio, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawRectangle(
    ctx: CanvasRenderingContext2D,
    toX: (time: UTCTimestamp) => number | null,
    toY: (price: number) => number | null,
    p1: DrawingAnchor,
    p2: DrawingAnchor,
    color: string,
    ratio: number,
  ): void {
    const x1 = toX(p1.time);
    const y1 = toY(p1.price);
    const x2 = toX(p2.time);
    const y2 = toY(p2.price);
    if (x1 == null || y1 == null || x2 == null || y2 == null) return;
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);
    ctx.save();
    ctx.globalAlpha *= 0.12;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, 1.5 * ratio);
    ctx.strokeRect(x, y, w, h);
  }

  private drawFib(
    ctx: CanvasRenderingContext2D,
    toX: (time: UTCTimestamp) => number | null,
    toY: (price: number) => number | null,
    width: number,
    p1: DrawingAnchor,
    p2: DrawingAnchor,
    color: string,
    ratio: number,
  ): void {
    const x1 = toX(p1.time);
    const x2 = toX(p2.time);
    if (x1 == null || x2 == null) return;
    const startX = Math.min(x1, x2);
    // Faint diagonal connecting the two anchors.
    const y1 = toY(p1.price);
    const y2 = toY(p2.price);
    if (y1 != null && y2 != null) {
      ctx.save();
      ctx.globalAlpha *= 0.5;
      ctx.setLineDash([4 * ratio, 4 * ratio]);
      this.strokeLine(ctx, x1, y1, x2, y2, color, Math.max(1, ratio));
      ctx.restore();
    }
    ctx.font = `${11 * ratio}px ui-monospace, SFMono-Regular, monospace`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    for (const level of FIB_LEVELS) {
      const price = fibPrice(p1, p2, level);
      const y = toY(price);
      if (y == null) continue;
      this.strokeLine(ctx, startX, y, width, y, color, Math.max(1, ratio));
      ctx.fillStyle = color;
      ctx.fillText(
        `${(level * 100).toFixed(1)}% · ${priceFormatter.format(price)}`,
        width - 6 * ratio,
        y - 3 * ratio,
      );
    }
  }

  private drawBrush(
    ctx: CanvasRenderingContext2D,
    toX: (time: UTCTimestamp) => number | null,
    toY: (price: number) => number | null,
    points: DrawingAnchor[],
    color: string,
    ratio: number,
  ): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.5, 2 * ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    let penDown = false;
    for (const point of points) {
      const x = toX(point.time);
      const y = toY(point.price);
      if (x == null || y == null) {
        penDown = false;
        continue;
      }
      if (!penDown) {
        ctx.moveTo(x, y);
        penDown = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}
