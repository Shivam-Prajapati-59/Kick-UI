import Image from "next/image";

// Static catalog thumbnail: two rippling rows of drops, frozen mid-wave.
const TILE = 36;

type Drop = {
  id: number;
  background: string;
};

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
  { id: 118, background: "#f7f08a" },
  { id: 142, background: "#ffb3c7" },
  { id: 177, background: "#ffd28a" },
  { id: 203, background: "#b8f2a6" },
  { id: 256, background: "#9ee7ff" },
  { id: 311, background: "#c6b6ff" },
  { id: 369, background: "#ffa98f" },
];

const EDGE_FADE =
  "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)";

function Tile({
  drop,
  offset,
  hovered = false,
}: {
  drop: Drop;
  offset: number;
  hovered?: boolean;
}) {
  return (
    <div
      className={`relative size-9 shrink-0 ${hovered ? "z-10" : ""}`}
      style={{ transform: `translateY(${offset}px)` }}
    >
      <div
        className={`size-9 overflow-hidden rounded-[9px] shadow-[0_1px_2px_rgb(0_0_0/0.06),0_10px_22px_-12px_rgb(0_0_0/0.28)] ${
          hovered ? "scale-105" : ""
        }`}
        style={{ background: drop.background }}
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
        <div className="absolute top-[22%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-1.5">
          {TOP_ROW.map((drop, i) => (
            <Tile
              key={drop.id}
              drop={drop}
              offset={Math.sin(i * 0.9 + 2.2) * 8}
              hovered={i === 3}
            />
          ))}
        </div>
        <div className="absolute top-[78%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-1.5">
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
        <p className="text-foreground max-w-[170px] text-[15px] leading-tight font-medium tracking-tight text-balance">
          Collect the next drop
        </p>
      </div>
    </div>
  );
}
