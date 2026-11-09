// Static catalog thumbnail: the real card needs WebGL and motion, so this only mirrors its layout.
export function WalletCardStill() {
  return (
    <div
      className="flex size-full items-center justify-center p-3"
      aria-hidden="true"
    >
      <div className="border-primary/40 bg-primary/40 w-full max-w-[220px] rounded-lg border p-1.5">
        <div className="bg-card relative overflow-hidden rounded-md px-3 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-muted ring-border size-5 rounded-full ring-1" />
              <span className="bg-foreground/80 h-1.5 w-12 rounded-full" />
            </div>
            <span className="border-border bg-muted h-3.5 w-7 rounded-md border" />
          </div>
          <p className="text-foreground mt-3 text-xl leading-none font-semibold tracking-tight">
            $18,240
            <span className="text-muted-foreground/60">.35</span>
          </p>
          <svg
            viewBox="0 0 100 32"
            preserveAspectRatio="none"
            className="text-primary -mx-3 mt-2 block h-10 w-[calc(100%+1.5rem)] max-w-none"
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
          <div className="border-muted-foreground/40 mt-2 flex justify-between border-t border-dotted pt-1.5">
            <span className="bg-muted-foreground/40 h-1 w-10 rounded-full" />
            <span className="bg-foreground/60 h-1 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
