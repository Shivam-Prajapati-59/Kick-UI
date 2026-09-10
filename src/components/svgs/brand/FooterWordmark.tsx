"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Space_Grotesk } from "next/font/google";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: "700" });

interface FooterWordmarkProps {
  text?: string;
  className?: string;
}

/**
 * Giant footer wordmark, outline-only style (stroke, no fill) — thin
 * bordered letters that sit quietly against the background, with a
 * brighter gradient stroke revealed under the cursor through a radial
 * mask.
 *
 * Robustness rules learned the hard way — glyphs are never geometrically
 * distorted (no spacingAndGlyphs stretching, no dash-draw tricks), the
 * aspect ratio is explicit, and the base layer needs no mask or hover
 * state to read at full opacity.
 *
 * Gradient/mask ids are unique per instance so repeats never collide.
 * Touch devices simply never trigger the spotlight; the solid outline
 * carries full visibility on its own.
 */
export default function FooterWordmark({
  text = "KICKUI",
  className,
}: FooterWordmarkProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  const uid = useId().replace(/:/g, "");
  const gradientId = `kw-gradient-${uid}`;
  const maskId = `kw-mask-${uid}`;
  const textMaskId = `kw-textmask-${uid}`;

  useEffect(() => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    setMaskPosition({
      cx: `${((cursor.x - rect.left) / rect.width) * 100}%`,
      cy: `${((cursor.y - rect.top) / rect.height) * 100}%`,
    });
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1200 200"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(event) => setCursor({ x: event.clientX, y: event.clientY })}
      className={cn(
        "block h-auto w-full cursor-pointer select-none",
        spaceGrotesk.className,
        className,
      )}
      style={{ aspectRatio: "1200 / 200" }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="1200"
          y2="0"
        >
          {hovered && (
            <>
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#06b6d4" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id={maskId}
          gradientUnits="userSpaceOnUse"
          r="22%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: 0.12, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id={textMaskId}>
          <rect
            x="0"
            y="0"
            width="1200"
            height="200"
            fill={`url(#${maskId})`}
          />
        </mask>
      </defs>

      {/* Outline base — stroke only, no fill */}
      <motion.text
        x="600"
        y="160"
        textAnchor="middle"
        textLength="1100"
        lengthAdjust="spacingAndGlyphs"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.6"
        fontSize="195"
        fontWeight="700"
        letterSpacing="-0.04em"
        className="text-foreground font-bold tracking-tighter"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        {text}
      </motion.text>

      {/* Cursor spotlight — bright gradient outline revealed through the mask */}
      <text
        x="600"
        y="160"
        textAnchor="middle"
        textLength="1100"
        lengthAdjust="spacingAndGlyphs"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        mask={`url(#${textMaskId})`}
        fontSize="195"
        fontWeight="700"
        letterSpacing="-0.04em"
        className="font-bold tracking-tighter"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        {text}
      </text>
    </svg>
  );
}
