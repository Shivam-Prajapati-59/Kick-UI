import Image from "next/image";
import { Copy, Plus } from "lucide-react";
import type { CSSProperties } from "react";

function Mark() {
  return (
    <svg
      viewBox="0 0 40 40"
      className="absolute top-2 right-2 size-6 fill-neutral-950"
      aria-hidden
    >
      <g transform="translate(9.5 9.5)">
        <circle cy="-4.6" r="3.8" />
        <circle cy="4.6" r="3.8" />
        <circle cx="-4.6" r="3.8" />
        <circle cx="4.6" r="3.8" />
      </g>
      <circle cx="30.5" cy="9.5" r="8.5" />
      <rect x="1" y="21" width="17" height="17" rx="5" />
      <rect x="22" y="21" width="17" height="17" rx="8.5" />
    </svg>
  );
}

export function GlyphCardStill() {
  return (
    <div
      className="flex size-full items-center justify-center p-3"
      aria-hidden="true"
    >
      <div
        style={{ "--glyph": "#8b65ec" } as CSSProperties}
        className="relative h-[146px] w-full max-w-[228px] overflow-hidden rounded-[22px] bg-[color-mix(in_oklab,var(--glyph)_14%,white)] text-neutral-950"
      >
        {/* Static glyph field: solid blocks left, dotted ramp fading right. */}
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute inset-y-0 left-0 w-1/2 bg-[repeating-linear-gradient(0deg,#8b65ec_0_5px,transparent_5px_10px),repeating-linear-gradient(90deg,#8b65ec_0_5px,transparent_5px_10px)] [mask-image:linear-gradient(90deg,#000_30%,transparent_75%)] opacity-25" />
          <div className="absolute inset-0 bg-[radial-gradient(#8b65ec_1px,transparent_1.4px)] [mask-image:linear-gradient(100deg,#000_0%,#000_45%,transparent_78%)] bg-[length:6px_6px] opacity-30" />
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-white/60 ring-inset"
        />

        <div className="relative flex h-full flex-col p-2.5">
          <div className="flex items-center gap-1.5">
            <span className="grid size-[18px] shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-black/5">
              <Image
                src="/assets/chains/ethereum.png"
                alt=""
                width={16}
                height={16}
              />
            </span>
            <span className="text-[10px] font-semibold tracking-tight">
              Ethereum
            </span>
          </div>

          <p className="mt-0.5 text-[28px] leading-none font-extrabold tracking-[-0.03em] whitespace-nowrap tabular-nums">
            $1,248.50
          </p>

          <div className="mt-1 flex items-center justify-between gap-2 text-[8px] font-semibold">
            <span className="flex min-w-0 items-center gap-1">
              <span className="grid size-2.5 place-items-center rounded-full bg-white text-[6px] font-bold text-neutral-950 ring-1 ring-black/5">
                U
              </span>
              <span className="truncate">1,248.50 USDC</span>
            </span>
            <span className="shrink-0 tabular-nums">$1,248.50</span>
          </div>

          <div className="mt-auto flex items-center gap-1.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-neutral-950 text-white">
              <Plus className="size-3.5" strokeWidth={2.5} />
            </span>
            <div className="flex h-7 min-w-0 flex-1 items-center justify-between gap-1 rounded-full bg-neutral-950 pr-1 pl-2.5 text-white">
              <span className="truncate font-mono text-[8px] tracking-tight">
                0xB8d5…563B
              </span>
              <span className="flex h-4 shrink-0 items-center gap-0.5 rounded-full bg-white/15 px-1.5 text-[6px] font-semibold tracking-wide">
                <Copy className="size-2" />
                COPY
              </span>
            </div>
          </div>
        </div>

        <Mark />
      </div>
    </div>
  );
}
