"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TimeframeTabs } from "@/components/ui/timeframe-tabs";
import {
  CandlestickSeries,
  HistogramSeries,
  LineStyle,
  createChart,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type UTCTimestamp,
} from "lightweight-charts";
import {
  Brush,
  Eraser,
  Minus,
  MousePointer2,
  MoveVertical,
  Percent,
  Square,
  Trash2,
  TrendingUp,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  DRAW_COLOR,
  hitTestDrawing,
  type Drawing,
  type DrawingAnchor,
  type DrawingTool,
} from "./drawings";
import { DrawingsPrimitive } from "./drawings-primitive";
import { TIMEFRAMES } from "./market-data";

export type { Drawing, DrawingAnchor, DrawingTool };
export type { UTCTimestamp };

export interface TradingChartTimeframe {
  id: string;
  label: string;
}

export type TradingFeedStatus = "live" | "connecting" | "simulated";

export interface TradingChartProps {
  /** Candles to render. Append/update the last entry to stream live data. */
  candles: CandlestickData<UTCTimestamp>[];
  /** Matching volumes. Omit to hide the volume pane. */
  volumes?: HistogramData<UTCTimestamp>[];
  /**
   * Identity of the dataset. A change performs a full resync (setData +
   * refit) instead of an incremental last-bar update — pass the active
   * timeframe id (or symbol+timeframe) here.
   */
  dataKey?: string;
  /** Base asset label. @default "BTC" */
  symbol?: string;
  /** Quote asset label. @default "USD" */
  quote?: string;
  /** Coin/logo image URL shown next to the symbol. Hidden when omitted. */
  logoSrc?: string;
  /** Timeframe pills. Pass `[]` to hide the selector. */
  timeframes?: TradingChartTimeframe[];
  /** Controlled active timeframe id. */
  activeTimeframe?: string;
  /** Uncontrolled initial timeframe id. @default first timeframe */
  defaultTimeframe?: string;
  /** Called with the timeframe id when the user picks one. */
  onTimeframeChange?: (id: string) => void;
  /**
   * Feed state shown as a status dot. Omit to hide the dot entirely
   * (e.g. for static datasets).
   */
  feedStatus?: TradingFeedStatus;
  /** Show the drawing-tools rail. @default true */
  showDrawingTools?: boolean;
  /** Controlled drawings. */
  drawings?: Drawing[];
  /** Uncontrolled initial drawings. */
  defaultDrawings?: Drawing[];
  /** Called with the next drawings on every add / erase / undo / clear. */
  onDrawingsChange?: (drawings: Drawing[]) => void;
  /** Chart height in px. @default 380 */
  height?: number;
  className?: string;
}

const DRAW_TOOLS: { id: DrawingTool; label: string; icon: LucideIcon }[] = [
  { id: "cursor", label: "Pan", icon: MousePointer2 },
  { id: "trend", label: "Trend line", icon: TrendingUp },
  { id: "horizontal", label: "Horizontal line", icon: Minus },
  { id: "vertical", label: "Vertical line", icon: MoveVertical },
  { id: "rectangle", label: "Rectangle", icon: Square },
  { id: "fib", label: "Fib retracement", icon: Percent },
  { id: "brush", label: "Brush (drag to draw)", icon: Brush },
  { id: "eraser", label: "Eraser (click a drawing to delete)", icon: Eraser },
];

const GRID_COLOR = "rgba(140, 160, 190, 0.12)";
const AXIS_TEXT_COLOR = "#8da1b9";
const UP_TEXT = "text-emerald-400";
const DOWN_TEXT = "text-red-400";

interface OhlcLegend {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

/** Convert a chart-surface point to a drawing anchor. Null when off-scale. */
function pointToAnchor(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  point: { x: number; y: number },
): DrawingAnchor | null {
  const time = chart.timeScale().coordinateToTime(point.x);
  const price = series.coordinateToPrice(point.y);
  if (typeof time !== "number" || price == null) return null;
  return { time: time as UTCTimestamp, price: Number(price) };
}

export function TradingChart({
  candles,
  volumes,
  dataKey,
  symbol = "BTC",
  quote = "USD",
  logoSrc,
  timeframes = TIMEFRAMES,
  activeTimeframe,
  defaultTimeframe,
  onTimeframeChange,
  feedStatus,
  showDrawingTools = true,
  drawings: controlledDrawings,
  defaultDrawings,
  onDrawingsChange,
  height = 380,
  className,
}: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const chartApiRef = useRef<IChartApi | null>(null);
  const pluginRef = useRef<DrawingsPrimitive | null>(null);
  const toolRef = useRef<DrawingTool>("cursor");
  const drawingsRef = useRef<Drawing[]>(
    controlledDrawings ?? defaultDrawings ?? [],
  );
  const pendingRef = useRef<DrawingAnchor | null>(null);
  const lastAnchorRef = useRef<DrawingAnchor | null>(null);
  const brushDownRef = useRef(false);
  const brushStrokeRef = useRef<DrawingAnchor[] | null>(null);
  const drawingIdRef = useRef(1);
  const syncKeyRef = useRef<string | undefined>(undefined);
  const syncLenRef = useRef(0);
  const syncTimeRef = useRef<UTCTimestamp | null>(null);
  const updateDrawingsRef = useRef<
    (fn: (prev: Drawing[]) => Drawing[]) => void
  >(() => {});

  const [tool, setTool] = useState<DrawingTool>("cursor");
  const [internalDrawings, setInternalDrawings] = useState<Drawing[]>(
    defaultDrawings ?? [],
  );
  const [internalTf, setInternalTf] = useState(
    defaultTimeframe ?? timeframes[0]?.id ?? "1H",
  );
  const [hovered, setHovered] = useState<OhlcLegend | null>(null);
  const [placing, setPlacing] = useState(false);

  const drawings = controlledDrawings ?? internalDrawings;
  const timeframeId = activeTimeframe ?? internalTf;
  const hasVolumes = volumes !== undefined && volumes.length > 0;
  const hasCandles = candles.length > 0;

  // Mirror latest state into refs for chart event handlers (runs every render).
  useEffect(() => {
    toolRef.current = tool;
    drawingsRef.current = drawings;
    updateDrawingsRef.current = (fn) => {
      const next = fn(drawingsRef.current);
      drawingsRef.current = next;
      if (controlledDrawings === undefined) setInternalDrawings(next);
      onDrawingsChange?.(next);
    };
  });

  const updateDrawings = useCallback((fn: (prev: Drawing[]) => Drawing[]) => {
    updateDrawingsRef.current(fn);
  }, []);

  const commitDrawing = useCallback(
    (drawing: Drawing) => {
      drawingIdRef.current += 1;
      updateDrawings((prev) => [...prev, drawing]);
    },
    [updateDrawings],
  );

  const eraseAt = useCallback((point: { x: number; y: number }) => {
    const chart = chartApiRef.current;
    const series = candleRef.current;
    if (!chart || !series) return;
    const converters = {
      toX: (time: UTCTimestamp) => chart.timeScale().timeToCoordinate(time),
      toY: (price: number) => series.priceToCoordinate(price),
    };
    updateDrawingsRef.current((prev) => {
      const reversedIndex = [...prev]
        .reverse()
        .findIndex((drawing) =>
          hitTestDrawing(drawing, point.x, point.y, converters),
        );
      if (reversedIndex === -1) return prev;
      const next = [...prev];
      next.splice(prev.length - 1 - reversedIndex, 1);
      return next;
    });
  }, []);

  const cancelPlacement = useCallback(() => {
    pendingRef.current = null;
    brushDownRef.current = false;
    brushStrokeRef.current = null;
    pluginRef.current?.setPreview(null);
    setPlacing(false);
  }, []);

  const selectTool = (next: DrawingTool) => {
    cancelPlacement();
    setTool(next);
  };

  const undoDrawing = () => {
    cancelPlacement();
    updateDrawings((prev) => prev.slice(0, -1));
  };

  const clearDrawings = () => {
    cancelPlacement();
    updateDrawings(() => []);
  };

  const handleTimeframe = (id: string) => {
    if (id === timeframeId) return;
    if (activeTimeframe === undefined) setInternalTf(id);
    onTimeframeChange?.(id);
  };

  /* ---- chart setup (rebuilt when the dataset identity changes) ---- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      handleScroll: toolRef.current === "cursor",
      handleScale: toolRef.current === "cursor",
      layout: {
        background: { color: "transparent" },
        textColor: AXIS_TEXT_COLOR,
      },
      grid: {
        vertLines: { color: GRID_COLOR },
        horzLines: { color: GRID_COLOR },
      },
      crosshair: {
        vertLine: {
          color: "rgba(140, 160, 190, 0.4)",
          style: LineStyle.Dashed,
          labelBackgroundColor: "#4b5563",
        },
        horzLine: {
          color: "rgba(140, 160, 190, 0.4)",
          style: LineStyle.Dashed,
          labelBackgroundColor: "#4b5563",
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      rightPriceScale: { borderVisible: false },
      localization: { locale: "en-US" },
    });
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      borderVisible: false,
    });
    let volumeSeries: ISeriesApi<"Histogram"> | null = null;
    if (hasVolumes) {
      const volumePane = chart.addPane();
      volumePane.setStretchFactor(0.25);
      volumeSeries = chart.addSeries(
        HistogramSeries,
        { priceFormat: { type: "volume" } },
        1,
      );
    }

    const plugin = new DrawingsPrimitive();
    candleSeries.attachPrimitive(plugin);
    pluginRef.current = plugin;
    chartApiRef.current = chart;
    plugin.setDrawings(drawingsRef.current);

    const handleDrawClick = (param: MouseEventParams) => {
      const activeTool = toolRef.current;
      if (activeTool === "cursor" || activeTool === "brush") return;
      if (!param.point || param.paneIndex !== 0) return;
      if (activeTool === "eraser") {
        eraseAt(param.point);
        return;
      }
      const anchor = pointToAnchor(chart, candleSeries, param.point);
      if (!anchor) return;
      if (activeTool === "horizontal") {
        commitDrawing({
          id: drawingIdRef.current,
          kind: "horizontal",
          price: anchor.price,
          color: DRAW_COLOR,
        });
        return;
      }
      if (activeTool === "vertical") {
        commitDrawing({
          id: drawingIdRef.current,
          kind: "vertical",
          time: anchor.time,
          color: DRAW_COLOR,
        });
        return;
      }
      const pending = pendingRef.current;
      if (!pending) {
        pendingRef.current = anchor;
        setPlacing(true);
        return;
      }
      pendingRef.current = null;
      setPlacing(false);
      plugin.setPreview(null);
      const id = drawingIdRef.current;
      if (activeTool === "trend") {
        commitDrawing({
          id,
          kind: "trend",
          p1: pending,
          p2: anchor,
          color: DRAW_COLOR,
        });
      } else if (activeTool === "rectangle") {
        commitDrawing({
          id,
          kind: "rectangle",
          p1: pending,
          p2: anchor,
          color: DRAW_COLOR,
        });
      } else {
        commitDrawing({
          id,
          kind: "fib",
          p1: pending,
          p2: anchor,
          color: DRAW_COLOR,
        });
      }
    };
    chart.subscribeClick(handleDrawClick);

    const handleCrosshair = (param: MouseEventParams) => {
      const activeTool = toolRef.current;
      const onMainPane = param.point != null && param.paneIndex === 0;
      const anchor =
        onMainPane && param.point
          ? pointToAnchor(chart, candleSeries, param.point)
          : null;
      lastAnchorRef.current = anchor;

      // In-progress drawing preview.
      if (
        (activeTool === "trend" ||
          activeTool === "rectangle" ||
          activeTool === "fib") &&
        pendingRef.current &&
        anchor
      ) {
        const pending = pendingRef.current;
        const id = -1;
        if (activeTool === "trend") {
          plugin.setPreview({
            id,
            kind: "trend",
            p1: pending,
            p2: anchor,
            color: DRAW_COLOR,
          });
        } else if (activeTool === "rectangle") {
          plugin.setPreview({
            id,
            kind: "rectangle",
            p1: pending,
            p2: anchor,
            color: DRAW_COLOR,
          });
        } else {
          plugin.setPreview({
            id,
            kind: "fib",
            p1: pending,
            p2: anchor,
            color: DRAW_COLOR,
          });
        }
      } else if (activeTool === "brush") {
        const stroke = brushStrokeRef.current;
        if (brushDownRef.current && anchor) {
          const next = stroke ? [...stroke, anchor] : [anchor];
          brushStrokeRef.current = next;
          plugin.setPreview({
            id: -1,
            kind: "brush",
            points: next,
            color: DRAW_COLOR,
          });
        }
      } else if (!pendingRef.current) {
        plugin.setPreview(null);
      }

      if (!param.time) {
        setHovered(null);
        return;
      }
      const candle = param.seriesData.get(candleSeries);
      if (
        candle &&
        "open" in candle &&
        "high" in candle &&
        "low" in candle &&
        "close" in candle
      ) {
        const volume =
          volumeSeries != null ? param.seriesData.get(volumeSeries) : undefined;
        setHovered({
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume:
            volume !== undefined &&
            volume !== null &&
            typeof volume === "object" &&
            "value" in volume &&
            typeof volume.value === "number"
              ? volume.value
              : null,
        });
      } else {
        setHovered(null);
      }
    };
    chart.subscribeCrosshairMove(handleCrosshair);

    // Brush uses press-and-drag: native buttons track the gesture, chart
    // events supply the coordinates so no pixel math is needed.
    const element = chart.chartElement();
    const handleMouseDown = (event: MouseEvent) => {
      if (toolRef.current !== "brush" || event.button !== 0) return;
      brushDownRef.current = true;
      const start = lastAnchorRef.current;
      if (start && !brushStrokeRef.current) {
        brushStrokeRef.current = [start];
        plugin.setPreview({
          id: -1,
          kind: "brush",
          points: [start],
          color: DRAW_COLOR,
        });
      }
    };
    const handleMouseUp = () => {
      if (toolRef.current !== "brush" || !brushDownRef.current) return;
      brushDownRef.current = false;
      const stroke = brushStrokeRef.current;
      brushStrokeRef.current = null;
      plugin.setPreview(null);
      if (stroke && stroke.length > 1) {
        commitDrawing({
          id: drawingIdRef.current,
          kind: "brush",
          points: stroke,
          color: DRAW_COLOR,
        });
      }
    };
    element.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    candleRef.current = candleSeries;
    volumeRef.current = volumeSeries;
    // New chart instance: forget what was synced into the previous one so
    // the data effect below performs a full setData + refit. Without this,
    // a remount (e.g. StrictMode) leaves an empty chart with a single
    // last-bar update and no fitContent.
    syncKeyRef.current = undefined;
    syncLenRef.current = 0;
    syncTimeRef.current = null;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width && width > 0) chart.applyOptions({ width });
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      element.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      chart.unsubscribeCrosshairMove(handleCrosshair);
      chart.unsubscribeClick(handleDrawClick);
      chart.remove();
      candleRef.current = null;
      volumeRef.current = null;
      chartApiRef.current = null;
      pluginRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey, hasVolumes, hasCandles]);

  /* ---- data sync: full resync on identity change, else last-bar update ---- */
  useEffect(() => {
    const candleApi = candleRef.current;
    const volumeApi = volumeRef.current;
    const chart = chartApiRef.current;
    if (!candleApi || candles.length === 0) return;
    const last = candles[candles.length - 1];
    const lastVolume = volumes?.[volumes.length - 1];
    const full =
      dataKey !== syncKeyRef.current ||
      candles.length < syncLenRef.current ||
      (syncTimeRef.current !== null && last.time < syncTimeRef.current);
    if (full) {
      candleApi.setData(candles);
      if (volumeApi) volumeApi.setData(volumes ?? []);
      chart?.timeScale().fitContent();
    } else {
      candleApi.update(last);
      if (volumeApi && lastVolume) volumeApi.update(lastVolume);
    }
    syncKeyRef.current = dataKey;
    syncLenRef.current = candles.length;
    syncTimeRef.current = last.time;
  }, [candles, volumes, dataKey, hasVolumes]);

  /* ---- keep the canvas primitive in sync with drawing state ---- */
  useEffect(() => {
    pluginRef.current?.setDrawings(drawings);
  }, [drawings]);

  /* ---- chart height follows the prop ---- */
  useEffect(() => {
    chartApiRef.current?.applyOptions({ height });
  }, [height]);

  /* ---- drawing tools lock pan/zoom so placement clicks don't move the chart ---- */
  useEffect(() => {
    const panning = tool === "cursor";
    chartApiRef.current?.applyOptions({
      handleScroll: panning,
      handleScale: panning,
    });
    const element = chartApiRef.current?.chartElement();
    if (element) {
      element.style.cursor = panning
        ? ""
        : tool === "eraser"
          ? "pointer"
          : "crosshair";
    }
  }, [tool]);

  /* ---- Escape cancels an in-progress drawing ---- */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      pendingRef.current = null;
      brushDownRef.current = false;
      brushStrokeRef.current = null;
      pluginRef.current?.setPreview(null);
      setPlacing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const lastCandle = candles[candles.length - 1];
  const lastVolume = volumes?.[volumes.length - 1];
  const shown: OhlcLegend = useMemo(
    () =>
      hovered ?? {
        open: lastCandle?.open ?? 0,
        high: lastCandle?.high ?? 0,
        low: lastCandle?.low ?? 0,
        close: lastCandle?.close ?? 0,
        volume: lastVolume?.value ?? null,
      },
    [hovered, lastCandle, lastVolume],
  );
  const firstOpen = candles[0]?.open ?? 0;
  const lastClose = lastCandle?.close ?? 0;
  const change = lastClose - firstOpen;
  const changePct = firstOpen !== 0 ? (change / firstOpen) * 100 : 0;
  const up = change >= 0;
  const barUp = shown.close >= shown.open;
  const barColor = barUp ? UP_TEXT : DOWN_TEXT;
  const activeLabel =
    timeframes.find((timeframe) => timeframe.id === timeframeId)?.label ??
    timeframeId;

  if (!hasCandles) return null;

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={cn(
          "border-border bg-card w-full overflow-hidden rounded-xl border",
          className,
        )}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 pb-0">
          <div className="flex items-center gap-2">
            {logoSrc && (
              <Image
                src={logoSrc}
                alt={`${symbol} logo`}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full"
              />
            )}
            <h2 className="text-lg font-bold tracking-tight">
              {symbol}{" "}
              <span className="text-muted-foreground font-medium">
                / {quote}
              </span>
            </h2>
            {feedStatus && (
              <span
                className="relative flex h-2 w-2 shrink-0"
                title={
                  feedStatus === "live"
                    ? "Live feed"
                    : feedStatus === "connecting"
                      ? "Connecting to live feed…"
                      : "Simulated feed"
                }
              >
                {feedStatus !== "simulated" && (
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                      feedStatus === "live" ? "bg-emerald-400" : "bg-amber-400",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative inline-flex h-2 w-2 rounded-full",
                    feedStatus === "live"
                      ? "bg-emerald-400"
                      : feedStatus === "connecting"
                        ? "bg-amber-400"
                        : "bg-zinc-500",
                  )}
                />
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl font-semibold tabular-nums sm:text-2xl">
              {lastClose.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span
              className={cn(
                "font-mono text-sm tabular-nums",
                up ? UP_TEXT : DOWN_TEXT,
              )}
            >
              {up ? "+" : ""}
              {change.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              ({up ? "+" : ""}
              {changePct.toFixed(2)}%)
            </span>
          </div>

          {timeframes.length > 0 && (
            <TimeframeTabs
              items={timeframes.map((timeframe) => timeframe.label)}
              value={activeLabel}
              onValueChange={(label) => {
                const match = timeframes.find(
                  (timeframe) => timeframe.label === label,
                );
                if (match) handleTimeframe(match.id);
              }}
              label="Chart timeframe"
              className="ml-auto"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pt-2 font-mono text-xs tabular-nums">
          <span className="text-muted-foreground">
            O{" "}
            <span className={barColor}>
              {shown.open.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </span>
          <span className="text-muted-foreground">
            H{" "}
            <span className={barColor}>
              {shown.high.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </span>
          <span className="text-muted-foreground">
            L{" "}
            <span className={barColor}>
              {shown.low.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </span>
          <span className="text-muted-foreground">
            C{" "}
            <span className={barColor}>
              {shown.close.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </span>
          {shown.volume != null && (
            <span className="text-muted-foreground">
              Vol{" "}
              <span className="text-foreground">
                {shown.volume >= 1_000_000
                  ? `${(shown.volume / 1_000_000).toFixed(2)}M`
                  : shown.volume >= 1_000
                    ? `${(shown.volume / 1_000).toFixed(2)}K`
                    : shown.volume.toFixed(2)}
              </span>
            </span>
          )}
          {placing && (
            <span className="text-muted-foreground ml-auto font-mono text-[11px]">
              Click chart to place · Esc to cancel
            </span>
          )}
        </div>

        <div className="flex">
          {showDrawingTools && (
            <>
              <div
                role="toolbar"
                aria-label="Drawing tools"
                className="flex flex-col items-center gap-1 px-2 py-3"
              >
                {DRAW_TOOLS.map(({ id, label, icon: Icon }) => (
                  <motion.button
                    key={id}
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-pressed={tool === id}
                    onClick={() => selectTool(id)}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "focus-visible:ring-ring relative grid h-8 w-8 place-items-center rounded-md transition-colors outline-none focus-visible:ring-2",
                      tool === id
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                    )}
                  >
                    {tool === id && (
                      <motion.span
                        layoutId="trading-chart-tool-active"
                        className="bg-secondary absolute inset-0 rounded-md"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
                      />
                    )}
                    <Icon className="relative z-10 h-4 w-4" />
                  </motion.button>
                ))}
                <div className="mt-auto flex flex-col items-center gap-1 pt-2">
                  <motion.button
                    type="button"
                    title="Undo last drawing"
                    aria-label="Undo last drawing"
                    onClick={undoDrawing}
                    disabled={drawings.length === 0}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="focus-visible:ring-ring text-muted-foreground hover:text-foreground hover:bg-secondary/50 grid h-8 w-8 place-items-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Undo2 className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    type="button"
                    title="Delete all drawings"
                    aria-label="Delete all drawings"
                    onClick={clearDrawings}
                    disabled={drawings.length === 0}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="focus-visible:ring-ring text-muted-foreground hover:text-foreground hover:bg-secondary/50 grid h-8 w-8 place-items-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
              <span
                aria-hidden="true"
                className="bg-border my-3 w-px shrink-0 self-stretch"
              />
            </>
          )}

          <div className="min-w-0 flex-1 p-2">
            <div ref={containerRef} className="w-full" style={{ height }} />
          </div>
        </div>
      </motion.div>
    </MotionConfig>
  );
}

export default TradingChart;
