import Image from "next/image";
import {
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type TokenAsset = {
  symbol: string;
  image?: string;
};

function Token({ asset }: { asset: TokenAsset }) {
  return (
    <div className="flex w-7 shrink-0 flex-col items-center gap-0.5">
      {asset.image ? (
        <Image
          src={asset.image}
          alt=""
          width={16}
          height={16}
          className="size-4 rounded-full bg-white"
        />
      ) : (
        <span className="grid size-4 place-items-center rounded-full bg-white text-[7px] font-bold text-neutral-950">
          {asset.symbol.charAt(0)}
        </span>
      )}
      <span className="text-[6px] leading-none font-semibold text-neutral-950">
        {asset.symbol}
      </span>
    </div>
  );
}

const ETH: TokenAsset = {
  symbol: "ETH",
  image: "/assets/chains/ethereum.png",
};
const SOL: TokenAsset = {
  symbol: "SOL",
  image: "/assets/chains/solana.png",
};
const USDC: TokenAsset = { symbol: "USDC" };

const STEPS = [
  {
    kind: "Swap",
    via: "Uniswap",
    sub: ["ETH → USDC", "on Ethereum"],
    state: "done",
  },
  {
    kind: "Bridge",
    via: "Circle CCTP",
    sub: ["USDC → USDC", "Ethereum → Solana"],
    state: "active",
  },
  {
    kind: "Swap",
    via: "Jupiter",
    sub: ["USDC → SOL", "on Solana"],
    state: "pending",
  },
] as const;

const MODES = ["Live", "In progress", "Completed", "Failed"] as const;

export function RouteTrackerStill() {
  return (
    <div
      className="flex size-full flex-col items-center justify-center gap-1 p-3"
      aria-hidden="true"
    >
      <div className="border-border bg-card w-full max-w-[340px] rounded-2xl border p-1.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#a6ec8f] text-neutral-950">
            <span className="grid size-3 place-items-center rounded border-[1.5px] border-current">
              <ArrowLeftRight className="size-1.5" strokeWidth={2.2} />
            </span>
          </span>
          <span className="text-foreground text-[10px] font-semibold tracking-tight">
            Bridge route
          </span>
          <p className="text-muted-foreground ml-auto shrink-0 text-[8px] font-semibold tracking-tight tabular-nums">
            ~2 min · <span className="text-foreground">67%</span>
          </p>
        </div>

        <div className="mt-1.5 grid grid-cols-[1fr_auto] gap-1.5">
          <div className="rounded-lg bg-[#b0a2f6] p-1.5 text-neutral-950">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[8px] leading-none font-semibold">
                Step 2 of 3
              </p>
              <ArrowUpRight className="size-2" strokeWidth={2.5} />
            </div>

            <div className="flex flex-col pt-0.5">
              <div className="flex items-start">
                <Token asset={ETH} />
                <span className="flex flex-1 items-center px-1 pt-1">
                  <span className="h-px flex-1 bg-neutral-950" />
                  <ChevronRight
                    className="-ml-0.5 size-1.5 shrink-0 text-neutral-950"
                    strokeWidth={2.75}
                  />
                </span>
                <Token asset={USDC} />
              </div>

              <div className="flex h-2.5 justify-end">
                <div className="flex w-7 shrink-0 justify-center py-0.5">
                  <span className="relative w-px bg-[repeating-linear-gradient(180deg,currentColor_0_2px,transparent_2px_4px)]">
                    <span className="absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-950 bg-[#a6ec8f]" />
                  </span>
                </div>
              </div>

              <div className="flex flex-row-reverse items-start">
                <Token asset={USDC} />
                <span className="flex flex-1 items-center px-1 pt-1">
                  <ChevronLeft
                    className="-mr-0.5 size-1.5 shrink-0 text-neutral-950/40"
                    strokeWidth={2.75}
                  />
                  <span className="h-px flex-1 bg-[repeating-linear-gradient(90deg,currentColor_0_2px,transparent_2px_4px)] text-neutral-950/40" />
                </span>
                <Token asset={SOL} />
              </div>
            </div>
          </div>

          <ol className="flex w-28 flex-col">
            {STEPS.map((step, index) => {
              const done = step.state === "done";
              const active = step.state === "active";
              const pending = step.state === "pending";
              return (
                <li
                  key={step.via}
                  className="relative flex-1 pb-1 pl-4 last:flex-none last:pb-0"
                >
                  {index < STEPS.length - 1 && (
                    <span className="bg-border absolute top-2.5 bottom-0 left-[5px] w-px overflow-hidden">
                      <span
                        className={`bg-foreground absolute inset-0 origin-top ${
                          done ? "" : "scale-y-0"
                        }`}
                      />
                    </span>
                  )}
                  <span
                    className={`absolute top-0 left-0 grid size-2.5 place-items-center rounded-full border ${
                      done
                        ? "border-foreground bg-foreground text-background"
                        : active
                          ? "border-foreground bg-[#a6ec8f]"
                          : "border-border bg-card"
                    }`}
                  >
                    {done && <Check className="size-1.5" strokeWidth={4} />}
                  </span>
                  <p
                    className={`text-[8px] leading-none font-semibold break-words ${
                      pending ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {step.kind}
                    <span className="text-muted-foreground font-medium">
                      {" "}
                      · {step.via}
                    </span>
                  </p>
                  <p className="text-muted-foreground mt-px text-[7px] leading-[7px] break-words">
                    {step.sub[0]}
                    <br />
                    {step.sub[1]}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="bg-muted/50 flex h-4 items-center gap-0.5 rounded-md p-0.5">
        {MODES.map((mode) => (
          <span
            key={mode}
            className={`rounded px-1 py-0.5 text-[6px] font-medium whitespace-nowrap ${
              mode === "Live"
                ? "border-border bg-background text-foreground border shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {mode}
          </span>
        ))}
      </div>
    </div>
  );
}
