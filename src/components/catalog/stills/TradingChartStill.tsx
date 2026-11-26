import Image from "next/image";
import {
  Minus,
  MousePointer2,
  MoveVertical,
  Percent,
  Square,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D"];
const ACTIVE_TIMEFRAME = "1H";
const UP = "#26a69a";
const DOWN = "#ef5350";

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Deterministic series: a seeded PRNG plus a drifting wave, so the thumbnail
// is identical on every render (no Math.random at render time).
function buildCandles(count = 48): Candle[] {
  let seed = 0x2f6e2b1;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const candles: Candle[] = [];
  let price = 66400;
  for (let index = 0; index < count; index += 1) {
    const open = price;
    const wave =
      240 * Math.sin(index / 6.3) + 150 * Math.sin(index / 2.6 + 1.1);
    const close = Math.max(
      60000,
      66400 - 100 * index + wave + (rand() - 0.5) * 240,
    );
    const spread = Math.abs(close - open);
    candles.push({
      open,
      high: Math.max(open, close) + rand() * (60 + spread * 0.5),
      low: Math.min(open, close) - rand() * (60 + spread * 0.5),
      close,
      volume: 180 + rand() * 260 + spread * 6,
    });
    price = close;
  }
  return candles;
}

const CANDLES = buildCandles();
const FIRST = CANDLES[0];
const LAST = CANDLES[CANDLES.length - 1];
const PRICE_MIN = Math.min(...CANDLES.map((candle) => candle.low));
const PRICE_MAX = Math.max(...CANDLES.map((candle) => candle.high));
const VOLUME_MAX = Math.max(...CANDLES.map((candle) => candle.volume));
const CHANGE = LAST.close - FIRST.open;
const CHANGE_PCT = (CHANGE / FIRST.open) * 100;
const LAST_UP = LAST.close >= LAST.open;
const LAST_COLOR = LAST_UP ? UP : DOWN;

const formatPrice = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const formatVolume = (value: number) =>
  value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(2)}M`
    : value >= 1_000
      ? `${(value / 1_000).toFixed(2)}K`
      : value.toFixed(2);

const PLOT_W = 258;
const PLOT_TOP = 2;
const PLOT_H = 78;
const VOL_TOP = 84;
const VOL_H = 20;
const yFor = (price: number) =>
  PLOT_TOP + ((PRICE_MAX - price) / (PRICE_MAX - PRICE_MIN)) * PLOT_H;
const GRID_LEVELS = [0, 1, 2, 3].map(
  (step) => PRICE_MAX - ((PRICE_MAX - PRICE_MIN) * step) / 3,
);

const TOOLS: { id: string; icon: LucideIcon; active?: boolean }[] = [
  { id: "cursor", icon: MousePointer2, active: true },
  { id: "trend", icon: TrendingUp },
  { id: "horizontal", icon: Minus },
  { id: "vertical", icon: MoveVertical },
  { id: "rectangle", icon: Square },
  { id: "fib", icon: Percent },
];

export function TradingChartStill() {
  const step = PLOT_W / CANDLES.length;
  const bodyWidth = Math.max(2, step * 0.62);
  const lastY = yFor(LAST.close);

  return (
    <div
      className="flex size-full items-center justify-center p-3"
      aria-hidden="true"
    >
      <div className="border-border bg-card w-full max-w-[260px] overflow-hidden rounded-xl border shadow-sm">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 px-3 pt-1.5">
          <Image
            src="/assets/chains/bitcoin.png"
            alt=""
            width={16}
            height={16}
            className="size-4 shrink-0 rounded-full"
          />
          <span className="text-foreground text-[10px] font-bold tracking-tight">
            BTC <span className="text-muted-foreground font-medium">/ USD</span>
          </span>
          <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
          <span className="text-foreground font-mono text-xs font-semibold tabular-nums">
            {formatPrice(LAST.close)}
          </span>
          <span
            className={`font-mono text-[8px] tabular-nums ${
              CHANGE >= 0 ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {CHANGE >= 0 ? "+" : ""}
            {CHANGE_PCT.toFixed(2)}%
          </span>
          <div className="border-border ml-auto flex items-center gap-0.5 rounded-md border p-0.5">
            {TIMEFRAMES.map((timeframe) => (
              <span
                key={timeframe}
                className={`rounded px-0.5 py-0.5 text-[7px] font-medium ${
                  timeframe === ACTIVE_TIMEFRAME
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {timeframe}
              </span>
            ))}
          </div>
        </div>

        <div className="text-muted-foreground flex items-center gap-2 px-3 pt-0.5 font-mono text-[8px] tabular-nums">
          {(
            [
              ["O", LAST.open],
              ["H", LAST.high],
              ["L", LAST.low],
              ["C", LAST.close],
            ] as const
          ).map(([label, value]) => (
            <span key={label}>
              {label}{" "}
              <span className={LAST_UP ? "text-emerald-500" : "text-red-500"}>
                {formatPrice(value)}
              </span>
            </span>
          ))}
          <span>
            Vol{" "}
            <span className="text-foreground">{formatVolume(LAST.volume)}</span>
          </span>
        </div>

        <div className="flex">
          <div className="flex w-[20px] flex-col items-center gap-0.5 py-1">
            {TOOLS.map(({ id, icon: Icon, active }) => (
              <span
                key={id}
                className={`grid size-3.5 place-items-center rounded ${
                  active ? "bg-muted text-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-2" />
              </span>
            ))}
          </div>
          <span className="bg-border my-1.5 w-px shrink-0" />

          <svg viewBox="0 0 300 108" className="block h-[108px] w-full">
            {GRID_LEVELS.map((level) => (
              <g key={level}>
                <line
                  x1="0"
                  x2={PLOT_W}
                  y1={yFor(level)}
                  y2={yFor(level)}
                  className="stroke-border"
                  strokeWidth="0.5"
                  opacity="0.7"
                />
                <text
                  x="298"
                  y={yFor(level) + 2.2}
                  textAnchor="end"
                  fontSize="6.5"
                  className="fill-muted-foreground font-mono"
                >
                  {level.toFixed(0)}
                </text>
              </g>
            ))}
            {[0, 64.5, 129, 193.5, 258].map((x) => (
              <line
                key={x}
                x1={x}
                x2={x}
                y1={PLOT_TOP}
                y2={VOL_TOP + VOL_H}
                className="stroke-border"
                strokeWidth="0.5"
                opacity="0.4"
              />
            ))}
            <line
              x1="0"
              x2={PLOT_W}
              y1={VOL_TOP - 2}
              y2={VOL_TOP - 2}
              className="stroke-border"
              strokeWidth="0.5"
              opacity="0.6"
            />

            {CANDLES.map((candle, index) => {
              const up = candle.close >= candle.open;
              const color = up ? UP : DOWN;
              const x = index * step + step / 2;
              const bodyTop = yFor(Math.max(candle.open, candle.close));
              const bodyHeight = Math.max(
                1,
                Math.abs(yFor(candle.open) - yFor(candle.close)),
              );
              const volumeHeight = (candle.volume / VOLUME_MAX) * VOL_H;
              return (
                <g key={index}>
                  <line
                    x1={x}
                    x2={x}
                    y1={yFor(candle.high)}
                    y2={yFor(candle.low)}
                    stroke={color}
                    strokeWidth="0.8"
                  />
                  <rect
                    x={x - bodyWidth / 2}
                    y={bodyTop}
                    width={bodyWidth}
                    height={bodyHeight}
                    fill={color}
                  />
                  <rect
                    x={x - bodyWidth / 2}
                    y={VOL_TOP + VOL_H - volumeHeight}
                    width={bodyWidth}
                    height={volumeHeight}
                    fill={color}
                    opacity="0.45"
                  />
                </g>
              );
            })}

            <line
              x1="0"
              x2={PLOT_W}
              y1={lastY}
              y2={lastY}
              stroke={LAST_COLOR}
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />
            <rect
              x={PLOT_W}
              y={lastY - 5.5}
              width="40"
              height="11"
              rx="2.5"
              fill={LAST_COLOR}
            />
            <text
              x={PLOT_W + 20}
              y={lastY + 2.2}
              textAnchor="middle"
              fontSize="6.5"
              fontWeight="600"
              fill="#ffffff"
              className="font-mono"
            >
              {LAST.close.toFixed(2)}
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
