"use client";

import { ArrowUpRight } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export interface FolderCardProps {
  number: string;
  title: string;
  description: string;
  image: { src: string; alt?: string };
  href?: string;
  background?: string;
  frameColor?: string;
  folderColor?: string;
  foreground?: string;
  noise?: boolean;
  className?: string;
}

const NOISE_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}`;

const MotionArrow = motion.create(ArrowUpRight);

const rootVariants = {
  rest: {},
  hover: { transition: { staggerChildren: 0.04 } },
};

const folderVariants = {
  rest: { y: 0 },
  hover: { y: 100 },
};

const objectVariants = {
  rest: { y: 96, scale: 0.82, rotate: -6 },
  hover: { y: 0, scale: 1, rotate: 0 },
};

const arrowVariants = {
  rest: { rotate: 0 },
  hover: { rotate: 45 },
};

export default function FolderCard({
  number,
  title,
  description,
  image,
  href,
  background = "linear-gradient(160deg, var(--primary) 0%, var(--background) 100%)",
  frameColor = "var(--border)",
  folderColor = "var(--card)",
  foreground = "var(--card-foreground)",
  noise = true,
  className,
}: FolderCardProps) {
  const rootClass = cn(
    "relative block isolate h-[400px] w-[300px] shrink-0 overflow-hidden rounded-[30px] border-[10px] border-solid border-(--fc-frame) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className,
  );

  const style = {
    "--fc-frame": frameColor,
    "--fc-folder": folderColor,
    "--fc-fg": foreground,
  } as CSSProperties;

  const inner = (
    <>
      <div className="absolute inset-0 rounded-[20px]" style={{ background }} />
      {noise && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80 mix-blend-overlay"
          style={{
            backgroundImage: `url("${NOISE_URI}")`,
            backgroundSize: "120px",
          }}
        />
      )}
      <motion.div
        className="absolute top-[22px] left-1/2 h-[150px] w-[210px] -translate-x-1/2"
        variants={objectVariants}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt ?? ""}
          draggable={false}
          className="h-full w-full object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.35)]"
        />
      </motion.div>
      <motion.div
        className="absolute inset-x-0 top-[70px] bottom-0"
        variants={folderVariants}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
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
            fill="var(--fc-folder)"
          />
        </svg>
        <div className="absolute inset-x-0 top-[30px] bottom-0 flex items-start justify-between rounded-tr-[20px] bg-(--fc-folder) p-5">
          <span className="text-[56px] leading-none font-medium tracking-tight text-(--fc-fg)">
            {number}
          </span>
          <MotionArrow
            className="size-5 text-(--fc-fg)"
            variants={arrowVariants}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        </div>
      </motion.div>
      <div className="absolute inset-x-5 bottom-5">
        <p className="text-base leading-snug font-medium text-(--fc-fg)">
          {title}
        </p>
        <p className="mt-1 text-sm leading-snug font-light text-(--fc-fg) opacity-70">
          {description}
        </p>
      </div>
    </>
  );

  return (
    <MotionConfig reducedMotion="user">
      {href ? (
        <motion.a
          href={href}
          className={rootClass}
          style={style}
          initial="rest"
          animate="rest"
          whileHover="hover"
          whileFocus="hover"
          whileTap="hover"
          variants={rootVariants}
        >
          {inner}
        </motion.a>
      ) : (
        <motion.div
          className={rootClass}
          style={style}
          initial="rest"
          animate="rest"
          whileHover="hover"
          whileTap="hover"
          variants={rootVariants}
        >
          {inner}
        </motion.div>
      )}
    </MotionConfig>
  );
}

export { FolderCard };
