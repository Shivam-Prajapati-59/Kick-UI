import Image from "next/image";

// Static catalog thumbnail: a frozen coverflow of coin cards, using the live
// component's slot geometry (0.962/1.793 card units, 0.82/0.738 scale).
const CARD_W = 108;
const CARD_H = 146;
const RADIUS = CARD_W * 0.08;

const EDGE_FADE =
  "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)";

type Coin = {
  id: number;
  name: string;
  gradient: string;
};

// Left to right; index 2 is the hero.
const COINS: Coin[] = [
  { id: 58, name: ":3", gradient: "linear-gradient(160deg, #f4f0ec, #d8cfc6)" },
  {
    id: 23,
    name: "Act I",
    gradient: "linear-gradient(160deg, #efe4f9, #c9aae8)",
  },
  {
    id: 7,
    name: "Peanut",
    gradient: "linear-gradient(160deg, #dcecfa, #93c4e8)",
  },
  {
    id: 12,
    name: "BLOB",
    gradient: "linear-gradient(160deg, #fbf6ec, #e5d2b3)",
  },
  {
    id: 41,
    name: "Macca",
    gradient: "linear-gradient(160deg, #f2e0e6, #c79aac)",
  },
];

// x is in card units; the centre card sits at 0.
const SLOTS = [
  { x: -1.793, scale: 0.738, opacity: 0.62, z: 10 },
  { x: -0.962, scale: 0.82, opacity: 1, z: 20 },
  { x: 0, scale: 1, opacity: 1, z: 30 },
  { x: 0.962, scale: 0.82, opacity: 1, z: 20 },
  { x: 1.793, scale: 0.738, opacity: 0.62, z: 10 },
];

export function NftCarouselStill() {
  return (
    <div
      className="flex size-full flex-col items-center justify-center gap-3 pb-3"
      aria-hidden="true"
    >
      {/* Extra block space keeps the card shadows inside the fade mask. */}
      <div
        className="relative w-full overflow-x-clip"
        style={{
          height: CARD_H + 32,
          marginBlock: -16,
          maskImage: EDGE_FADE,
          WebkitMaskImage: EDGE_FADE,
        }}
      >
        {COINS.map((coin, i) => {
          const slot = SLOTS[i];
          const isCenter = i === 2;
          return (
            <div
              key={coin.id}
              className="absolute top-1/2 left-1/2"
              style={{
                width: CARD_W,
                height: CARD_H,
                borderRadius: RADIUS,
                boxShadow: "0 10px 24px -8px rgb(0 0 0 / 0.28)",
                transform: `translate(-50%, -50%) translateX(${slot.x * CARD_W}px) scale(${slot.scale})`,
                opacity: slot.opacity,
                zIndex: slot.z,
              }}
            >
              {/* One clip on the group, so the image and overlay edges match. */}
              <div
                className="absolute inset-0"
                style={{
                  background: coin.gradient,
                  clipPath: `inset(0 round ${RADIUS}px)`,
                }}
              >
                <Image
                  src={`/assets/nfts/noun-${coin.id}.svg`}
                  alt=""
                  width={CARD_W}
                  height={CARD_H}
                  unoptimized
                  className={`absolute inset-0 h-full w-full object-cover [image-rendering:pixelated] ${
                    isCenter ? "" : "scale-[1.06]"
                  }`}
                />
                {isCenter ? (
                  <>
                    <div className="from-card via-card/95 absolute -inset-x-px -bottom-px h-[56%] bg-linear-to-t via-40% to-transparent" />
                    <div className="text-card-foreground bg-background/60 absolute top-[5px] left-[5px] flex items-center gap-[3px] rounded-full py-[2px] pr-[5px] pl-[3px] text-[7px] font-medium tabular-nums backdrop-blur-md">
                      {/* Points down for the negative move, as in the live card. */}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="text-primary size-[7px] rotate-90"
                      >
                        <path d="M7 17 17 7M8 7h9v9" />
                      </svg>
                      -1.6%
                    </div>
                    <div className="text-card-foreground bg-background/60 absolute top-[5px] right-[5px] rounded-full px-[5px] py-[2px] text-[7px] font-medium backdrop-blur-md">
                      $PNUT
                    </div>
                    <div className="text-card-foreground absolute right-[6px] bottom-[6px] left-[6px]">
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="truncate text-[9px] leading-none font-medium">
                          {coin.name}
                        </p>
                        <span className="text-muted-foreground shrink-0 text-[6px] leading-none tabular-nums">
                          MC $30.1M
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-[3px] text-[6px] leading-none">
                        Graduated
                      </p>
                      <div className="bg-foreground/10 mt-[3px] h-[3px] overflow-hidden rounded-full">
                        <div className="bg-primary h-full w-full rounded-full" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-card-foreground bg-background/60 absolute bottom-[5px] left-[5px] rounded-full px-[5px] py-[2px] text-[6px] font-medium backdrop-blur-md">
                    {coin.name}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5">
        {COINS.map((coin, i) => (
          <span
            key={coin.id}
            className={`h-[5px] rounded-full ${
              i === 2 ? "bg-primary w-[22px]" : "bg-foreground/20 w-[5px]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
