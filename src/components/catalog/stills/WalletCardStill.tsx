// Static catalog thumbnail: the real card needs WebGL and motion, so this only mirrors its layout.
export function WalletCardStill() {
  return (
    <div
      className="flex size-full items-center justify-center p-3"
      aria-hidden="true"
    >
      <div className="border-primary/40 bg-primary/40 w-full max-w-[220px] rounded-lg border p-1.5">
        <div className="bg-card relative overflow-hidden rounded-md px-3 pt-2 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-muted ring-border size-5 rounded-full ring-1" />
              <div>
                <p className="text-foreground text-[11px] leading-none font-semibold">
                  Main wallet
                </p>
                <p className="text-muted-foreground mt-1 text-[9px] leading-none">
                  0x4f2a…c81e
                </p>
              </div>
            </div>
            <span className="border-border bg-muted text-muted-foreground rounded-md border px-1.5 py-1 text-[8px] leading-none font-semibold">
              24H
            </span>
          </div>
          <p className="text-muted-foreground mt-2 text-[9px] leading-none">
            Wallet balance
          </p>
          <p className="text-foreground mt-1 text-xl leading-none font-semibold tracking-tight">
            $18,240
            <span className="text-muted-foreground/60">.35</span>
          </p>
          <p className="mt-1 text-[9px] leading-none font-medium text-emerald-500">
            +$480.35 +2.70%
          </p>
          <svg
            viewBox="0 0 100 32"
            preserveAspectRatio="none"
            className="text-primary -mx-3 mt-1 block h-8 w-[calc(100%+1.5rem)] max-w-none"
            fill="none"
          >
            <path
              d="M0 26 L10 24 L22 18 L32 20 L44 12 L56 15 L68 8 L80 10 L90 4 L100 7"
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
            <path
              d="M0 26 L10 24 L22 18 L32 20 L44 12 L56 15 L68 8 L80 10 L90 4 L100 7 L100 32 L0 32 Z"
              fill="currentColor"
              opacity="0.12"
            />
          </svg>
          <div className="border-muted-foreground/40 mt-1 flex justify-between border-t border-dotted pt-1 text-[9px] leading-none">
            <span className="text-muted-foreground">Total rewards</span>
            <span className="text-foreground font-semibold">$1,521.32</span>
          </div>
        </div>
      </div>
    </div>
  );
}
