"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export type FolderCardProps = {
  number: string;
  title: string;
  description: string;
  objectSrc: string;
  frameColor: string;
  folderColor: string;
  textColor: string;
  background: string;
};

const MotionArrow = motion.create(ArrowUpRight);

export default function FolderCard({
  number,
  title,
  description,
  objectSrc,
  frameColor,
  folderColor,
  textColor,
  background,
}: FolderCardProps) {
  const reduced = useReducedMotion();

  return (
    // Card root
    <motion.div
      className="relative isolate h-[400px] w-[300px] overflow-hidden rounded-[30px] border-[10px] border-solid"
      style={{ borderColor: frameColor }}
      initial="rest"
      whileHover="hover"
      variants={{ hover: { transition: { staggerChildren: 0.05 } } }}
    >
      {/* background layer */}
      <div
        data-layer="background"
        className="absolute inset-0 rounded-[20px]"
        style={{ background }}
      />

      {/* object layer (pop-out image, rests behind the folder front) */}
      <motion.div
        data-layer="object"
        className="absolute top-[40px] left-1/2 z-10 h-[200px] w-[200px] -translate-x-1/2"
        variants={{ rest: { y: 40, scale: 0.9 }, hover: { y: 0, scale: 1 } }}
        transition={{ type: "spring", stiffness: 300, damping: 14 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={objectSrc} alt="" className="h-full w-full object-contain" />
      </motion.div>

      {/* folder layer (front group that will later slide down) */}
      <motion.div
        data-layer="folder"
        variants={
          reduced
            ? { rest: { opacity: 1 }, hover: { opacity: 1 } }
            : { rest: { y: 0 }, hover: { y: 100 } }
        }
        className="absolute top-[70px] right-0 bottom-0 left-0 z-20"
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
      >
        {/* tab */}
        <svg
          data-layer="tab"
          width="150"
          height="32"
          viewBox="0 0 150 32"
          className="absolute top-0 left-0"
          aria-hidden
        >
          <path
            d="M0 32V20C0 9 9 0 20 0H80C90 0 95 4 101 11L111 23C116 29 121 32 130 32Z"
            fill={folderColor}
          />
        </svg>

        {/* folder body */}
        <div
          data-layer="folder-body"
          className="absolute top-[30px] right-0 bottom-0 left-0 flex items-start justify-between rounded-tr-[20px] p-5"
          style={{ background: folderColor }}
        >
          <span
            className="text-[56px] leading-none font-medium"
            style={{ color: textColor }}
          >
            {number}
          </span>
          <MotionArrow
            className="size-5"
            style={{ color: textColor }}
            variants={
              reduced
                ? { rest: { rotate: 0 }, hover: { rotate: 0 } }
                : { rest: { rotate: 0 }, hover: { rotate: 45 } }
            }
          />
        </div>
      </motion.div>

      {/* text layer (stays put, above everything) */}
      <div data-layer="text" className="absolute right-5 bottom-5 left-5 z-40">
        <p className="text-base font-medium" style={{ color: textColor }}>
          {title}
        </p>
        <p
          className="text-sm font-light opacity-70"
          style={{ color: textColor }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}
