import Image from "next/image";
import { ArrowUpDown, ChevronDown, Settings2 } from "lucide-react";

const SOL = "https://assets.coingecko.com/coins/images/4128/large/solana.png";
const USDC = "https://assets.coingecko.com/coins/images/6319/large/USDC.png";

const ACCENT =
  "radial-gradient(80% 120% at 12% 0%, rgba(255,255,255,0.55) 0%, transparent 55%), radial-gradient(90% 130% at 92% 100%, #8b5cf6 0%, transparent 60%), linear-gradient(115deg, #7dd3fc 0%, #93c5fd 30%, #818cf8 65%, #a78bfa 100%)";

const NOISE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

function Panel({
  label,
  amount,
  symbol,
  logo,
  sub,
}: {
  label: string;
  amount: string;
  symbol: string;
  logo: string;
  sub: string;
}) {
  return (
    <div className="border-border/60 bg-muted/50 rounded-[12px] border px-2 py-1.5">
      <p className="text-muted-foreground text-[6.5px] leading-none font-medium tracking-[0.14em] uppercase">
        {label}
      </p>
      <div className="mt-0.5 flex items-center gap-1">
        <p className="text-foreground min-w-0 flex-1 truncate text-base leading-none font-semibold tracking-tight tabular-nums">
          {amount}
        </p>
        <span className="border-border/60 bg-card flex shrink-0 items-center gap-0.5 rounded-full border py-0.5 pr-1 pl-0.5">
          <Image
            src={logo}
            alt=""
            width={10}
            height={10}
            className="size-2.5 rounded-full"
          />
          <span className="text-foreground text-[7px] font-semibold">
            {symbol}
          </span>
          <ChevronDown className="text-muted-foreground size-2" />
        </span>
      </div>
      <p className="text-muted-foreground mt-0.5 text-[6.5px] leading-none tabular-nums">
        {sub}
      </p>
    </div>
  );
}

export function SwapPanelStill() {
  return (
    <div
      className="flex size-full items-center justify-center"
      aria-hidden="true"
    >
      <div className="border-border/70 bg-card relative w-full max-w-[260px] rounded-[20px] border p-2 shadow-sm">
        <div className="flex items-center justify-between gap-1">
          <div className="bg-muted/60 flex items-center gap-0.5 rounded-full p-0.5">
            <span className="border-border/70 bg-card dark:bg-muted text-foreground rounded-full border px-2 py-0.5 text-[8px] font-medium">
              Market
            </span>
            <span className="text-muted-foreground px-2 py-0.5 text-[8px] font-medium">
              Limit
            </span>
          </div>
          <span className="text-muted-foreground grid size-4 place-items-center rounded-full">
            <Settings2 className="size-2.5" />
          </span>
        </div>

        <div className="relative mt-1.5 flex flex-col gap-1">
          <Panel
            label="You pay"
            amount="1.25"
            symbol="SOL"
            logo={SOL}
            sub="$177.89 · Balance: 12.4"
          />
          <Panel
            label="You receive"
            amount="177.87"
            symbol="USDC"
            logo={USDC}
            sub="$177.87 · Balance: 2,480.50"
          />
          <span className="border-border bg-card absolute top-1/2 left-1/2 grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded border shadow-sm">
            <ArrowUpDown className="text-foreground size-2" />
          </span>
        </div>

        <div className="text-muted-foreground mt-1 flex items-center justify-between gap-1 text-[6.5px] tabular-nums">
          <span>
            1 SOL ≈ <span className="text-foreground font-medium">142.31</span>{" "}
            USDC
          </span>
          <span className="border-muted-foreground/40 size-1.5 rounded-full border" />
        </div>

        <div
          className="relative mt-1 flex h-6 items-center justify-center overflow-hidden rounded-full text-[8px] font-semibold text-neutral-950"
          style={{ background: ACCENT }}
        >
          <span
            className="absolute inset-0 opacity-80 mix-blend-overlay"
            style={{ backgroundImage: NOISE, backgroundSize: "120px" }}
          />
          <span className="relative">Swap</span>
        </div>
      </div>
    </div>
  );
}
