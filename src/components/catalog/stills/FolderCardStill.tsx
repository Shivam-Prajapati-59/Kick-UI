import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";

interface MiniCardProps {
  frameColor: string;
  folderColor: string;
  foreground: string;
  background: string;
  imageSrc: string;
  number: string;
  title: string;
  description: string;
  hover?: boolean;
}

function MiniCard({
  frameColor,
  folderColor,
  foreground,
  background,
  imageSrc,
  number,
  title,
  description,
  hover = false,
}: MiniCardProps) {
  const folderTransform = hover ? "translateY(100px)" : "none";
  const objectTransform = hover
    ? "none"
    : "translateY(96px) scale(0.82) rotate(-6deg)";
  const arrowTransform = hover ? "rotate(45deg)" : "none";

  return (
    <div
      className="relative isolate h-[400px] w-[300px] shrink-0 overflow-hidden rounded-[30px] border-[10px] border-solid"
      style={{ borderColor: frameColor } as CSSProperties}
    >
      <div className="absolute inset-0 rounded-[20px]" style={{ background }} />
      <div
        className="absolute top-[14px] left-1/2 h-[170px] w-[230px] -translate-x-1/2"
        style={{ transform: objectTransform }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt=""
          draggable={false}
          className="h-full w-full object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.35)]"
        />
      </div>
      <div
        className="absolute inset-x-0 top-[70px] bottom-0"
        style={{ transform: folderTransform }}
      >
        <svg
          width={150}
          height={32}
          viewBox="0 0 150 32"
          className="absolute top-0 left-0"
          aria-hidden
        >
          <path
            d="M0 32V20C0 9 9 0 20 0H80C90 0 95 4 101 11L111 23C116 29 121 32 130 32Z"
            fill={folderColor}
          />
        </svg>
        <div
          className="absolute inset-x-0 top-[30px] bottom-0 flex items-start justify-between rounded-tr-[20px] p-5"
          style={{ background: folderColor }}
        >
          <span
            className="text-[56px] leading-none font-medium tracking-tight"
            style={{ color: foreground }}
          >
            {number}
          </span>
          <ArrowUpRight
            className="size-5"
            style={{ color: foreground, transform: arrowTransform }}
          />
        </div>
      </div>
      <div className="absolute inset-x-5 bottom-5">
        <p
          className="text-base leading-snug font-medium"
          style={{ color: foreground }}
        >
          {title}
        </p>
        <p
          className="mt-1 text-sm leading-snug font-light opacity-70"
          style={{ color: foreground }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export function FolderCardStill() {
  return (
    <div
      className="flex size-full items-center justify-center gap-4 p-2"
      aria-hidden="true"
    >
      <div className="relative h-[180px] w-[135px] shrink-0 overflow-hidden rounded-[14px]">
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[300px] origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.45]">
          <MiniCard
            frameColor="#050826"
            folderColor="#0b1042"
            foreground="#ffffff"
            background="radial-gradient(90% 70% at 15% 5%, #7b6bff 0%, transparent 60%), radial-gradient(80% 60% at 90% 30%, #22c1ff 0%, transparent 55%), linear-gradient(165deg, #3b2ce0 0%, #1b15b0 55%, #0b1042 100%)"
            imageSrc="/assets/folder-card/solana-wallet.webp"
            number="01"
            title="Link every chain"
            description="Hold Solana, EVM and more in a single wallet."
          />
        </div>
      </div>
      <div className="relative h-[180px] w-[135px] shrink-0 overflow-hidden rounded-[14px]">
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[300px] origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.45]">
          <MiniCard
            frameColor="#020403"
            folderColor="#08140d"
            foreground="#ffffff"
            background="radial-gradient(70% 55% at 75% 10%, #e2ff4a 0%, transparent 55%), radial-gradient(90% 70% at 20% 40%, #1fe06f 0%, transparent 60%), linear-gradient(180deg, #06200f 0%, #020403 100%)"
            imageSrc="/assets/folder-card/neon-arrow.webp"
            number="02"
            title="Swap in one tap"
            description="Route the best price and confirm with a single signature."
            hover
          />
        </div>
      </div>
    </div>
  );
}
