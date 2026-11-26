import Image from "next/image";
import { ArrowUpDown, ChevronDown } from "lucide-react";

const SOL = "https://assets.coingecko.com/coins/images/4128/large/solana.png";
const USDC = "https://assets.coingecko.com/coins/images/6319/large/USDC.png";

function PuzzleTab({
  color,
  at,
  size,
}: {
  color: string;
  at: string;
  size: number;
}) {
  const r = 5;
  const g = 2;
  const inner = r - g;
  const outer = r + g;
  const pad = r + 1;
  const length = size + pad * 2;
  const across = g * 2 + 10 + 1;
  const a0 = pad;
  const a1 = pad + size;
  const tip = g + 10;

  const pt = (a: number, c: number) => `${a} ${c + 1}`;
  const arc = (rad: number, sweep: 0 | 1, a: number, c: number) =>
    `A ${rad} ${rad} 0 0 ${sweep} ${pt(a, c)}`;

  const notch = [
    `M ${pt(a0 - r, -1)}`,
    `L ${pt(a0 - r, g)}`,
    arc(inner, 1, a0 - g, r),
    `L ${pt(a0 - g, tip - r)}`,
    arc(outer, 0, a0 + r, tip + g),
    `L ${pt(a1 - r, tip + g)}`,
    arc(outer, 0, a1 + g, tip - r),
    `L ${pt(a1 + g, r)}`,
    arc(inner, 1, a1 + r, g),
    `L ${pt(a1 + r, -1)}`,
    "Z",
  ].join(" ");

  const tab = [
    `M ${pt(a0 - r, -1)}`,
    `L ${pt(a0 - r, 0)}`,
    arc(r, 1, a0, r),
    `L ${pt(a0, tip - r)}`,
    arc(r, 0, a0 + r, tip),
    `L ${pt(a1 - r, tip)}`,
    arc(r, 0, a1, tip - r),
    `L ${pt(a1, r)}`,
    arc(r, 1, a1 + r, 0),
    `L ${pt(a1 + r, -1)}`,
    "Z",
  ].join(" ");

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-full h-0"
    >
      <svg
        className="absolute overflow-visible"
        style={{ top: -1, left: `calc(${at} - ${pad}px)` }}
        width={length}
        height={across}
        viewBox={`0 0 ${length} ${across}`}
      >
        <path d={notch} fill="var(--background)" />
        <path d={tab} fill={color} />
      </svg>
    </span>
  );
}

function Chip({ logo, symbol }: { logo: string; symbol: string }) {
  return (
    <span className="border-border/60 bg-card flex shrink-0 items-center gap-0.5 rounded-full border py-0.5 pr-1 pl-0.5">
      <Image
        src={logo}
        alt=""
        width={10}
        height={10}
        className="size-2.5 rounded-full"
      />
      <span className="text-foreground text-[7px] font-semibold">{symbol}</span>
      <ChevronDown className="text-muted-foreground size-2" />
    </span>
  );
}

export function SnapSwapStill() {
  return (
    <div
      className="flex size-full items-center justify-center"
      aria-hidden="true"
    >
      <div className="relative flex w-full max-w-[260px] flex-col gap-0.5 rounded-[16px] bg-[var(--background)] p-0.5">
        <div className="relative rounded-[14px] bg-[#dcd3fb] px-2 py-1 text-neutral-950 dark:brightness-[0.88]">
          <div className="flex items-center gap-0.5 rounded-full bg-neutral-950/10 p-0.5">
            <span className="rounded-full bg-neutral-950 px-2 py-0.5 text-[8px] font-medium text-white">
              Market
            </span>
            <span className="px-2 py-0.5 text-[8px] font-medium text-neutral-950/75">
              Limit
            </span>
          </div>
        </div>

        <div className="relative rounded-[14px] bg-[#f4c6e6] px-2 py-1 text-neutral-950 dark:brightness-[0.88]">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[7px] font-medium opacity-85">Slippage</span>
            <span className="rounded-full bg-neutral-950 px-2 py-0.5 text-[7px] font-medium text-white">
              Auto 0.5%
            </span>
          </div>
        </div>

        <div className="relative z-30 rounded-[14px] bg-[#bfe9dc] px-2 py-1 text-neutral-950 dark:brightness-[0.88]">
          <p className="text-[6.5px] leading-none font-medium opacity-85">
            You pay
          </p>
          <div className="mt-0.5 flex items-center gap-1">
            <p className="min-w-0 flex-1 truncate text-base leading-none font-semibold tracking-tight tabular-nums">
              1.25
            </p>
            <Chip logo={SOL} symbol="SOL" />
          </div>
          <p className="mt-0.5 text-[6.5px] leading-none text-neutral-950/80 tabular-nums">
            $177.89 · Balance: 12.4
          </p>
          <PuzzleTab color="#bfe9dc" at="50%" size={40} />
          <span className="absolute bottom-0 left-1/2 z-40 grid size-6 -translate-x-1/2 translate-y-1/2 place-items-center rounded-full bg-neutral-950 text-white ring-2 ring-[var(--background)]">
            <ArrowUpDown className="size-3 transition-transform duration-300 group-hover:rotate-180 motion-reduce:transition-none" />
          </span>
        </div>

        <div className="relative z-20 rounded-[14px] bg-[#d9f26b] px-2 py-1 text-neutral-950 dark:brightness-[0.88]">
          <p className="text-[6.5px] leading-none font-medium opacity-85">
            You receive
          </p>
          <div className="mt-0.5 flex items-center gap-1">
            <p className="min-w-0 flex-1 truncate text-base leading-none font-semibold tracking-tight tabular-nums">
              177.87
            </p>
            <Chip logo={USDC} symbol="USDC" />
          </div>
          <p className="mt-0.5 text-[6.5px] leading-none text-neutral-950/80 tabular-nums">
            $177.87
          </p>
        </div>

        <div className="relative rounded-[14px] bg-[#f9d3e9] px-2 py-1 text-neutral-950 dark:brightness-[0.88]">
          <p className="text-[6.5px] leading-none font-medium tabular-nums opacity-85">
            1 SOL ≈ 142.31 USDC
          </p>
        </div>

        <div className="flex h-6 items-center justify-center rounded-[14px] bg-[#9fd3f5] text-[8px] font-semibold text-neutral-950 dark:brightness-[0.88]">
          Swap
        </div>
      </div>
    </div>
  );
}
