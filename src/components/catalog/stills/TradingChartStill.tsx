const candles = [
  [77, 67, 58, 84], [67, 72, 62, 79], [72, 59, 52, 77],
  [59, 64, 54, 70], [64, 53, 46, 68], [53, 58, 49, 66],
  [58, 45, 39, 62], [45, 51, 42, 58], [51, 41, 34, 56],
  [41, 46, 37, 53], [46, 32, 26, 50], [32, 38, 29, 45],
] as const;

export function TradingChartStill() {
  return (
    <div className="flex size-full items-center justify-center p-3" aria-hidden="true">
      <div className="border-border bg-card w-full max-w-[300px] overflow-hidden rounded-xl border shadow-sm">
        <div className="border-border flex items-center justify-between border-b px-3 py-2">
          <span className="text-xs font-semibold text-foreground">BTC / USD</span>
          <span className="text-[11px] font-medium text-emerald-500">+2.42%</span>
        </div>
        <svg viewBox="0 0 300 118" className="h-[112px] w-full" preserveAspectRatio="none">
          {[30, 60, 90].map((y) => (
            <line key={y} x1="0" x2="300" y1={y} y2={y} className="stroke-border" strokeWidth="0.75" />
          ))}
          {candles.map(([open, close, high, low], index) => {
            const x = 18 + index * 24;
            const rising = close < open;
            return (
              <g key={index} className={rising ? "text-emerald-500" : "text-rose-500"}>
                <line x1={x} x2={x} y1={high} y2={low} stroke="currentColor" strokeWidth="1.5" />
                <rect x={x - 5} y={Math.min(open, close)} width="10" height={Math.max(2, Math.abs(open - close))} fill="currentColor" rx="1" />
                <rect x={x - 4} y={102 - (index * 7) % 13} width="8" height={16 + (index * 7) % 13} fill="currentColor" opacity="0.35" />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
