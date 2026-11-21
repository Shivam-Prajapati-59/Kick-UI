import Image from "next/image";

// Static catalog thumbnail: two rippling rows of pixel-art drops, frozen
// mid-wave, matching the live component's slot geometry.
const TILE = 40;
const RADIUS = 8;

const EDGE_FADE =
  "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)";

type Drop = { id: number; background: string };

const TOP_ROW: Drop[] = [
  { id: 7, background: "#ffb3c7" },
  { id: 12, background: "#ffd28a" },
  { id: 23, background: "#b8f2a6" },
  { id: 41, background: "#9ee7ff" },
  { id: 58, background: "#c6b6ff" },
  { id: 77, background: "#ffa98f" },
  { id: 96, background: "#8ff0d6" },
];

const BOTTOM_ROW: Drop[] = [
  { id: 177, background: "#ffd28a" },
  { id: 203, background: "#b8f2a6" },
  { id: 256, background: "#9ee7ff" },
  { id: 311, background: "#c6b6ff" },
  { id: 369, background: "#ffa98f" },
  { id: 420, background: "#8ff0d6" },
  { id: 488, background: "#f7f08a" },
];

function Tile({ drop, offset }: { drop: Drop; offset: number }) {
  return (
    <div
      className="relative shrink-0"
      style={{
        width: TILE,
        height: TILE,
        transform: `translateY(${offset}px)`,
      }}
    >
      {/* Soft coloured glow behind the tile, like the live component. */}
      <div
        className="absolute -z-10 scale-110 rounded-[inherit] opacity-50 blur-xl saturate-150"
        style={{
          inset: 0,
          background: drop.background,
          borderRadius: RADIUS,
        }}
        aria-hidden="true"
      >
        <Image
          src={`/assets/nfts/noun-${drop.id}.svg`}
          alt=""
          width={TILE}
          height={TILE}
          unoptimized
          className="h-full w-full object-cover [image-rendering:pixelated]"
        />
      </div>
      <div
        className="relative h-full w-full overflow-hidden shadow-[0_1px_2px_rgb(0_0_0/0.06),0_10px_22px_-12px_rgb(0_0_0/0.28)]"
        style={{ background: drop.background, borderRadius: RADIUS }}
      >
        <Image
          src={`/assets/nfts/noun-${drop.id}.svg`}
          alt=""
          width={TILE}
          height={TILE}
          unoptimized
          className="h-full w-full object-cover [image-rendering:pixelated]"
        />
      </div>
    </div>
  );
}

export function WaveCarouselStill() {
  return (
    <div className="relative size-full overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 z-10"
        style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
      >
        <div className="absolute top-[22%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-2">
          {TOP_ROW.map((drop, i) => (
            <Tile
              key={drop.id}
              drop={drop}
              offset={Math.sin(i * 0.9 + 2.2) * 8}
            />
          ))}
        </div>
        <div className="absolute top-[78%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-2">
          {BOTTOM_ROW.map((drop, i) => (
            <Tile
              key={drop.id}
              drop={drop}
              offset={Math.sin(i * 0.9 - 1.13) * 8}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center px-3 text-center">
        <p className="text-foreground max-w-[180px] text-[13px] leading-tight font-medium tracking-tight text-balance">
          Collect the next drop
        </p>
        <p className="text-muted-foreground mt-1 max-w-[200px] text-[9px] leading-snug text-balance">
          Mint, trade and show off pixel art from creators onchain, with zero
          gas on your first claim.
        </p>
      </div>
    </div>
  );
}
