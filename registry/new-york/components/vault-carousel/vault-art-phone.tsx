"use client";

import { motion } from "motion/react";
import { ArtFrame, Float, Rise, Sparkles, useArt } from "./vault-art-core";

export function PhoneArt() {
  const { id: p, live, motionAllowed } = useArt();
  // Faces of the upright phone: front (left iso plane), right side, top.
  const FRONT = "matrix(1 0.5 0 1 296 260)";
  const ridges = [0, 1, 2].map((i) => {
    const r = 4 + i * 4;
    return `M${23 - r} ${44 - i} V38 A${r} ${r} 0 0 1 ${23 + r} 38 V${46 - i}`;
  });
  return (
    <ArtFrame viewBox="252 246 160 204">
      <defs>
        <filter id={`${p}-fp1`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <linearGradient
          id={`${p}-fp2`}
          x1="263.75"
          y1="0"
          x2="386.25"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fdfcfa" />
          <stop offset="0.4" stopColor="#f1ede6" />
          <stop offset="0.65" stopColor="#ddd4c4" />
          <stop offset="0.87" stopColor="#cbbfaa" />
          <stop offset="0.87" stopColor="#141414" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
        <linearGradient
          id={`${p}-fp3`}
          x1="269"
          y1="0"
          x2="381"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#36a8ff" />
          <stop offset="0.3" stopColor="#1490f7" />
          <stop offset="0.72" stopColor="#0c7fe6" />
          <stop offset="1" stopColor="#0a56a8" />
        </linearGradient>
        <linearGradient
          id={`${p}-fp4`}
          x1="263.75"
          y1="0"
          x2="386.25"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fdfcfa" />
          <stop offset="0.4" stopColor="#f3efe8" />
          <stop offset="0.68" stopColor="#e3dbcc" />
          <stop offset="0.92" stopColor="#cdc1ab" />
          <stop offset="0.93" stopColor="#141414" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
        <clipPath id={`${p}-fp5`}>
          <path d="M263.75,351 A61.25,30 0 1 0 386.25,351 A61.25,30 0 1 0 263.75,351 Z" />
        </clipPath>
        <filter id={`${p}-fp6`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        {/* Phone: white front, cream-to-ink side band, blue screen. */}
        <linearGradient
          id={`${p}-fp7`}
          x1="0"
          y1="0"
          x2="46"
          y2="84"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eee9e1" />
        </linearGradient>
        <linearGradient
          id={`${p}-fp8`}
          x1="0"
          y1="0"
          x2="10"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#e3dbcc" />
          <stop offset="0.7" stopColor="#c3b7a1" />
          <stop offset="0.71" stopColor="#141414" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
        <linearGradient
          id={`${p}-fp9`}
          x1="0"
          y1="9"
          x2="0"
          y2="73"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#36a8ff" />
          <stop offset="0.5" stopColor="#0f92fa" />
          <stop offset="1" stopColor="#0a7be8" />
        </linearGradient>
        <clipPath id={`${p}-fp10`}>
          <rect x="5" y="9" width="36" height="64" rx="2.5" />
        </clipPath>
      </defs>
      <ellipse
        cx="372"
        cy="424"
        rx="34"
        ry="22"
        fill="#a6c6ef"
        filter={`url(#${p}-fp1)`}
        opacity=".9"
      />
      <Rise>
        <path
          d="M263.75,380 L263.75,414 A61.25,30 0 0 0 386.25,414 L386.25,380 A61.25,30 0 0 1 263.75,380 Z"
          fill={`url(#${p}-fp2)`}
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M263.75,380 A61.25,30 0 1 0 386.25,380 A61.25,30 0 1 0 263.75,380 Z"
          fill="#f8f6f1"
          stroke="#121212"
          strokeWidth="1.5"
        />
        <ellipse cx="277.4" cy="421.88" rx="1.9" ry="2.2" fill="#121212" />
        <ellipse cx="281.69" cy="424.21" rx="1.9" ry="2.2" fill="#121212" />
        <ellipse cx="286.45" cy="426.31" rx="1.9" ry="2.2" fill="#121212" />
        <path
          d="M355.62,439.98 L355.62,405.98"
          fill="none"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity=".7"
        />
      </Rise>
      <Rise delay={0.05}>
        <path
          d="M269,370 L269,381 A56,27.5 0 0 0 381,381 L381,370 A56,27.5 0 0 1 269,370 Z"
          fill={`url(#${p}-fp3)`}
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </Rise>
      <Rise delay={0.1}>
        <path
          d="M263.75,351 L263.75,371 A61.25,30 0 0 0 386.25,371 L386.25,351 A61.25,30 0 0 1 263.75,351 Z"
          fill={`url(#${p}-fp4)`}
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M263.75,351 A61.25,30 0 1 0 386.25,351 A61.25,30 0 1 0 263.75,351 Z"
          fill="#fdfcfa"
          stroke="#121212"
          strokeWidth="1.5"
        />
        <g clipPath={`url(#${p}-fp5)`}>
          <ellipse
            cx="330"
            cy="356"
            rx="40"
            ry="18"
            fill="#a9cbf5"
            opacity=".75"
            filter={`url(#${p}-fp6)`}
          />
        </g>
        <path
          d="M263.75,351 A61.25,30 0 1 0 386.25,351 A61.25,30 0 1 0 263.75,351 Z"
          fill="none"
          stroke="#121212"
          strokeWidth="1.5"
        />
      </Rise>
      <Rise delay={0.35} from={-30}>
        <Float lift={8}>
          {/* Top edge, right side (thickness), then the front face. */}
          <path
            d="M296,260 L342,283 L352,278 L306,255 Z"
            fill="#fdfcfa"
            stroke="#121212"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <g transform="matrix(1 -0.5 0 1 342 283)">
            <rect
              x="0"
              y="0"
              width="10"
              height="84"
              fill={`url(#${p}-fp8)`}
              stroke="#121212"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>
          <g transform={FRONT}>
            <rect
              x="0"
              y="0"
              width="46"
              height="84"
              rx="4"
              fill={`url(#${p}-fp7)`}
              stroke="#121212"
              strokeWidth="1.5"
            />
            <rect x="3" y="3" width="40" height="78" rx="3" fill="#121212" />
            <rect x="18" y="5" width="10" height="2" rx="1" fill="#4a4a4a" />
            <rect
              x="5"
              y="9"
              width="36"
              height="64"
              rx="2.5"
              fill={`url(#${p}-fp9)`}
            />
            <g
              fill="none"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M23 39 V49" />
              {ridges.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
            {/* Scan bar sweeps the screen while live. */}
            <g clipPath={`url(#${p}-fp10)`}>
              <motion.g
                initial={false}
                animate={
                  live && motionAllowed
                    ? {
                        y: [0, 56, 0],
                        opacity: 1,
                        transition: {
                          y: {
                            duration: 2.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          opacity: { duration: 0.2 },
                        },
                      }
                    : { y: 0, opacity: 0 }
                }
              >
                <rect
                  x="5"
                  y="7"
                  width="36"
                  height="9"
                  fill="#fff"
                  opacity="0.3"
                />
                <rect x="5" y="15" width="36" height="2" fill="#fff" />
              </motion.g>
            </g>
            <rect x="17" y="76" width="12" height="2" rx="1" fill="#5a5a5a" />
          </g>
          <Sparkles
            at={[
              [368, 266, 6],
              [377, 280, 3.5],
            ]}
          />
        </Float>
      </Rise>
    </ArtFrame>
  );
}
