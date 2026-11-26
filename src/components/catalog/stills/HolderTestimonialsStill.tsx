import Image from "next/image";
import { BadgeCheck } from "lucide-react";

// Static catalog thumbnail: one expanded holder card beside collapsed chain strips.
const STRIPS = [
  { bg: "#274690", logo: "base" },
  { bg: "#f2a65a", logo: "bitcoin" },
  { bg: "#123c33", logo: "solana" },
];

export function HolderTestimonialsStill() {
  return (
    <div
      className="flex size-full items-center justify-center gap-1.5 p-3"
      aria-hidden="true"
    >
      <div
        className="flex h-[120px] w-[164px] flex-col justify-between rounded-2xl p-3"
        style={{ background: "#c9d2f7", color: "#151a3d" }}
      >
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-black/12 text-[11px] font-semibold">
            M
          </span>
          <div className="leading-tight">
            <p className="flex items-center gap-1 text-[12px] font-semibold">
              mira.eth
              <BadgeCheck className="size-3" />
            </p>
            <p className="font-mono text-[9px] opacity-70">0x7a3f…c91e</p>
          </div>
        </div>
        <p className="text-[11px] leading-snug">
          “Early on Ethereum. The docs made integrating feel effortless.”
        </p>
        <div className="flex items-center gap-1.5 text-[10px] font-medium">
          <Image
            src="/assets/chains/ethereum.png"
            alt=""
            width={14}
            height={14}
          />
          42 ETH
        </div>
      </div>
      {STRIPS.map((strip) => (
        <div
          key={strip.logo}
          className="flex h-[120px] w-[24px] items-end justify-center rounded-full pb-2"
          style={{ background: strip.bg }}
        >
          <Image
            src={`/assets/chains/${strip.logo}.png`}
            alt=""
            width={16}
            height={16}
          />
        </div>
      ))}
    </div>
  );
}
