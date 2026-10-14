"use client";

import { useEffect, useId, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * Web3KitHero — isometric hero illustration for a web3 UI component library.
 *
 * A "dock" holding the pieces of a dApp: wallet screen, sign card, hex-address plate,
 * a padlock that closes when you connect (its keyhole is the Ethereum diamond),
 * a wallet that pops BTC / ETH / SOL coins, a swap panel, a verified shield and a
 * code tag. Everything runs on one 6s "connect → sign → lock → pay" story loop.
 *
 * Usage:
 *   <Web3KitHero />
 *   <Web3KitHero width={560} background={false} speed={1.2} />
 *
 * Props:
 *   width       CSS width (default "100%")
 *   background  true = rounded violet panel with halftone, false = transparent (default true)
 *   bg          panel colour (default "#8f8cff")
 *   accent      highlight colour (default "#d6ff3d")
 *   speed       animation speed multiplier (default 1)
 *   codeLabel   text typed on the code tag (default "<ConnectButton />")
 *   animated    default true (respects prefers-reduced-motion)
 *   className, style
 */

const K = 0.577;
const INK = "#0b0b17";
const LIL1 = "#e4e1ff";
const LIL2 = "#bdb8ff";
const LIL3 = "#9d98ff";
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

type Pt = [number, number];

const P = (x: number, y: number, z = 0): Pt => [x - y, K * (x + y) - z];
const fmt = (a: Pt[]) =>
  a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
const ML = `matrix(1 ${K} 0 1 0 0)`; // plane facing front-left
const MR = `matrix(1 ${-K} 0 1 0 0)`; // plane facing front-right
const MF = `matrix(1 ${K} -1 ${K} 0 0)`; // floor

/* ------------------------------------------------------------------ */
/* primitives                                                         */
/* ------------------------------------------------------------------ */
interface BoxProps {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  top: string;
  left: string;
  right: string;
  sw?: number;
}

function Box({ x, y, z = 0, w, d, h, top, left, right, sw = 3 }: BoxProps) {
  const T = [
    P(x, y, z + h),
    P(x + w, y, z + h),
    P(x + w, y + d, z + h),
    P(x, y + d, z + h),
  ];
  const L = [
    P(x, y + d, z + h),
    P(x + w, y + d, z + h),
    P(x + w, y + d, z),
    P(x, y + d, z),
  ];
  const R = [
    P(x + w, y + d, z + h),
    P(x + w, y, z + h),
    P(x + w, y, z),
    P(x + w, y + d, z),
  ];
  const s = { stroke: INK, strokeWidth: sw, strokeLinejoin: "round" as const };
  return (
    <g>
      <polygon points={fmt(L)} fill={left} {...s} />
      <polygon points={fmt(R)} fill={right} {...s} />
      <polygon points={fmt(T)} fill={top} {...s} />
    </g>
  );
}

/** Extruded flat shape standing on a plane. orient "L" faces front-left, "R" faces front-right. */
interface SlabProps {
  orient: "L" | "R";
  o: Pt;
  depth: number;
  shape: (fill: string | null, stroke: string) => ReactNode;
  children?: ReactNode;
  step?: number;
}

function Slab({ orient, o, depth, shape, children, step = 2 }: SlabProps) {
  const M = orient === "L" ? ML : MR;
  const dx = orient === "L" ? 1 : -1;
  const layers = [];
  for (let i = depth; i >= step; i -= step) layers.push(i);
  return (
    <g transform={`translate(${o[0].toFixed(1)} ${o[1].toFixed(1)})`}>
      {layers.map((i) => (
        <g key={i} transform={`translate(${dx * i} ${-K * i}) ${M}`}>
          {shape(INK, INK)}
        </g>
      ))}
      <g transform={M}>
        {shape(null, INK)}
        {children}
      </g>
    </g>
  );
}

/* official glyph paths ------------------------------------------------ */
interface EthGlyphProps {
  cx: number;
  cy: number;
  h: number;
  mono: boolean;
  fill: string;
}

function EthGlyph({ cx, cy, h, mono, fill }: EthGlyphProps) {
  const s = h / 417;
  const c = mono
    ? Array(6).fill(fill)
    : ["#343434", "#8C8C8C", "#3C3C3B", "#8C8C8C", "#141414", "#393939"];
  return (
    <g transform={`translate(${cx - 128 * s} ${cy - 208.5 * s}) scale(${s})`}>
      <path
        fill={c[0]}
        d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"
      />
      <path fill={c[1]} d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
      <path
        fill={c[2]}
        d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"
      />
      <path fill={c[3]} d="M127.962 416.905v-104.72L0 236.585z" />
      <path fill={c[4]} d="M127.961 287.958l127.96-75.637-127.96-58.162z" />
      <path fill={c[5]} d="M0 212.32l127.96 75.638v-133.8z" />
    </g>
  );
}

interface CoinGlyphProps {
  cx: number;
  cy: number;
  s: number;
}

function BtcGlyph({ cx, cy, s }: CoinGlyphProps) {
  return (
    <g
      transform={`translate(${cx - 1250 * s} ${cy - 1250 * s}) scale(${s})`}
      fill={INK}
    >
      <path d="m1741.5 943.8c-16.1-167.4-160.6-223.5-343.2-239.5v-232.3h-141.3v226.1c-37.1 0-75.1.7-112.8 1.5v-227.6h-141.3l-.1 232.1c-30.6.6-60.7 1.2-90 1.2v-.7l-194.9-.1v151s104.4-2 102.6-.1c57.3 0 75.9 33.2 81.3 61.9v264.6c4 0 9.1.2 14.9 1h-14.9l-.1 370.7c-2.5 18-13.1 46.7-53.1 46.8 1.8 1.6-102.7 0-102.7 0l-28.1 168.8h184c34.2 0 67.9.6 100.9.8l.1 234.9h141.2v-232.4c38.7.8 76.2 1.1 112.9 1.1l-.1 231.3h141.3v-234.4c237.6-13.6 404.1-73.5 424.7-296.7 16.7-179.7-67.8-260-202.7-292.4 82.1-41.6 133.4-115.1 121.4-237.6zm-197.8 502.2c0 175.5-300.5 155.6-396.4 155.6v-311.3c95.9.2 396.4-27.3 396.4 155.7zm-65.8-439.1c0 159.7-250.8 141-330.6 141.1v-282.2c79.9 0 330.7-25.4 330.6 141.1z" />
    </g>
  );
}

function SolGlyph({ cx, cy, s }: CoinGlyphProps) {
  return (
    <g
      transform={`translate(${cx - 198.85 * s} ${cy - 155.85 * s}) scale(${s})`}
      fill={INK}
    >
      <path d="m64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8h-317.4c-5.8 0-8.7-7-4.6-11.1z" />
      <path d="m64.6 3.8c2.5-2.4 5.8-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8h-317.4c-5.8 0-8.7-7-4.6-11.1z" />
      <path d="m333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8h-317.4c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1z" />
    </g>
  );
}

interface SparkleProps {
  x: number;
  y: number;
  s?: number;
  delay?: number;
  color?: string;
}

function Sparkle({ x, y, s = 1, delay = 0, color = INK }: SparkleProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        className="w3-twinkle"
        d="M0 -10 V10 M-10 0 H10"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
        style={{ animationDelay: `${delay}s` }}
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* the scene                                                          */
/* ------------------------------------------------------------------ */
const HEX = "0123456789ABCDEF";
const FINAL = ["7F", "A3", "9C", "0E"];
const rnd = () => HEX[(Math.random() * 16) | 0] + HEX[(Math.random() * 16) | 0];

interface Web3KitHeroProps {
  width?: string | number;
  background?: boolean;
  bg?: string;
  accent?: string;
  speed?: number;
  codeLabel?: string;
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function Web3KitHero({
  width = "100%",
  background = true,
  bg = "#8f8cff",
  accent = "#d6ff3d",
  speed = 1,
  codeLabel = "<ConnectButton />",
  animated = true,
  className,
  style,
}: Web3KitHeroProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (n: string) => `${n}-${uid}`;
  const hexRefs = useRef<Array<SVGTextElement | null>>([]);

  // hex bytes scramble, then resolve (synced with the CSS loop)
  useEffect(() => {
    const set = (arr: string[]) =>
      hexRefs.current.forEach((el, i) => {
        if (el) el.textContent = arr[i] ?? "";
      });
    set(FINAL);
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!animated || reduce) return undefined;
    const cyc = 6000 / speed;
    const t0 = performance.now();
    const iv = setInterval(() => {
      const ph = ((performance.now() - t0) % cyc) / cyc;
      set(FINAL.map((f, i) => (ph > 0.14 && ph < 0.2 + i * 0.035 ? rnd() : f)));
    }, 80);
    return () => clearInterval(iv);
  }, [animated, speed]);

  const LIME = accent;
  const ox = 360;
  const oy = 430;

  // ---- geometry ----
  const shadowSteps = Array.from({ length: 14 }, (_, i) => i * 2.6);

  return (
    <svg
      viewBox="0 0 720 760"
      width={width}
      className={className}
      style={
        {
          display: "block",
          maxWidth: "100%",
          height: "auto",
          "--sp": speed,
          ...style,
        } as CSSProperties
      }
      role="img"
      aria-label="Isometric illustration of web3 UI components: a wallet screen, signature card, address plate, padlock, coin wallet, swap arrows and a verified shield"
      data-animated={animated ? "true" : "false"}
    >
      <title>Web3 UI kit</title>
      <style>{`
        [data-animated="true"] .w3-btn{animation:w3-btn calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-on{animation:w3-on calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-off{animation:w3-off calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-sign{animation:w3-sign calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-pop{animation:w3-pop calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-shackle{animation:w3-shackle calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-glow{animation:w3-glow calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-coin{animation:w3-coin calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-type{animation:w3-type calc(6s / var(--sp)) steps(18,end) infinite}
        [data-animated="true"] .w3-float{animation:w3-float calc(4s / var(--sp)) ease-in-out infinite}
        [data-animated="true"] .w3-arrA{animation:w3-arrA calc(3s / var(--sp)) ease-in-out infinite}
        [data-animated="true"] .w3-arrB{animation:w3-arrB calc(3s / var(--sp)) ease-in-out infinite}
        [data-animated="true"] .w3-dash{animation:w3-dash calc(1.4s / var(--sp)) linear infinite}
        [data-animated="true"] .w3-blink{animation:w3-blink calc(1.6s / var(--sp)) ease-in-out infinite}
        [data-animated="true"] .w3-twinkle{animation:w3-twinkle calc(2.4s / var(--sp)) ease-in-out infinite}
        [data-animated="true"] .w3-shield{animation:w3-shield calc(6s / var(--sp)) infinite}
        .w3-pop,.w3-twinkle,.w3-shield{transform-box:fill-box;transform-origin:center}
        .w3-type{transform-box:fill-box;transform-origin:right center}
        .w3-sign{stroke-dasharray:230}
        @keyframes w3-btn{0%,6%{transform:translateY(0)}9%{transform:translateY(3px)}13%,100%{transform:translateY(0)}}
        @keyframes w3-on{0%,12%{opacity:0}14%,90%{opacity:1}96%,100%{opacity:0}}
        @keyframes w3-off{0%,12%{opacity:1}14%,90%{opacity:0}96%,100%{opacity:1}}
        @keyframes w3-sign{0%,14%{stroke-dashoffset:230}32%,92%{stroke-dashoffset:0}98%,100%{stroke-dashoffset:230}}
        @keyframes w3-pop{0%,31%{transform:scale(0)}36%{transform:scale(1.25)}40%,92%{transform:scale(1)}98%,100%{transform:scale(0)}}
        @keyframes w3-shackle{0%,28%{transform:translateY(-24px)}38%,90%{transform:translateY(0)}98%,100%{transform:translateY(0)}}
        @keyframes w3-glow{0%,38%{opacity:0}44%,90%{opacity:1}96%,100%{opacity:0}}
        @keyframes w3-coin{0%,50%{transform:translateY(0)}57%{transform:translateY(-48px)}64%{transform:translateY(0)}67%{transform:translateY(-7px)}70%,100%{transform:translateY(0)}}
        @keyframes w3-type{0%,16%{transform:scaleX(1)}42%{transform:scaleX(0)}90%{transform:scaleX(0)}96%,100%{transform:scaleX(1)}}
        @keyframes w3-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes w3-arrA{0%,100%{transform:translateX(-8px)}50%{transform:translateX(10px)}}
        @keyframes w3-arrB{0%,100%{transform:translateX(10px)}50%{transform:translateX(-8px)}}
        @keyframes w3-dash{to{stroke-dashoffset:-24}}
        @keyframes w3-blink{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes w3-twinkle{0%,100%{opacity:.25;transform:scale(.55)}50%{opacity:1;transform:scale(1)}}
        @keyframes w3-shield{0%,36%{transform:scale(1)}42%{transform:scale(1.18)}50%,100%{transform:scale(1)}}
        @media (prefers-reduced-motion: reduce){
          [data-animated="true"] *{animation:none !important}
          [data-animated="true"] .w3-on,[data-animated="true"] .w3-glow{opacity:1}
          [data-animated="true"] .w3-off{opacity:0}
        }
      `}</style>

      <defs>
        <pattern
          id={id("dots")}
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2.5" cy="2.5" r="1" fill={INK} />
        </pattern>
        <pattern
          id={id("dotsL")}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="3.5" cy="3.5" r="1.4" fill={INK} />
        </pattern>
        <radialGradient id={id("fade")}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <linearGradient id={id("vfade")} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={id("m1")}>
          <circle cx="120" cy="640" r="230" fill={`url(#${id("fade")})`} />
        </mask>
        <mask id={id("m2")}>
          <circle cx="640" cy="130" r="200" fill={`url(#${id("fade")})`} />
        </mask>
        <mask id={id("m3")}>
          <rect
            x="-400"
            y="-120"
            width="800"
            height="240"
            fill={`url(#${id("vfade")})`}
          />
        </mask>
        <clipPath id={id("panel")}>
          <rect width="720" height="760" rx="40" />
        </clipPath>
      </defs>

      {background && (
        <g clipPath={`url(#${id("panel")})`}>
          <rect width="720" height="760" fill={bg} />
          <rect
            width="720"
            height="760"
            fill={`url(#${id("dotsL")})`}
            opacity=".35"
            mask={`url(#${id("m1")})`}
          />
          <rect
            width="720"
            height="760"
            fill={`url(#${id("dotsL")})`}
            opacity=".3"
            mask={`url(#${id("m2")})`}
          />
        </g>
      )}

      <g transform={`translate(${ox} ${oy})`} strokeLinejoin="round">
        {/* ---------------- dock platform ---------------- */}
        {/* hard ground shadow */}
        <g>
          {shadowSteps.map((s, i) => (
            <polygon
              key={i}
              points={fmt(
                [
                  P(-150, -150, -36),
                  P(150, -150, -36),
                  P(150, 150, -36),
                  P(-150, 150, -36),
                ].map((p) => [p[0] + s, p[1] + s * 0.95] as Pt),
              )}
              fill={INK}
            />
          ))}
        </g>
        <Box
          x={-150}
          y={-150}
          z={-36}
          w={300}
          d={300}
          h={36}
          top={LIL1}
          left="#fff"
          right={LIL3}
          sw={3.5}
        />
        {/* top inset + halftone */}
        <polygon
          points={fmt([P(-132, -132), P(132, -132), P(132, 132), P(-132, 132)])}
          fill="none"
          stroke={INK}
          strokeWidth="1.6"
          opacity=".55"
        />
        <g
          mask={`url(#${id("m3")})`}
          transform={`translate(0 ${P(0, 0)[1] + 90})`}
        >
          <polygon
            points={fmt([
              P(-150, -150),
              P(150, -150),
              P(150, 150),
              P(-150, 150),
            ])}
            transform={`translate(0 ${-90})`}
            fill={`url(#${id("dots")})`}
            opacity=".5"
          />
        </g>
        {/* left face details */}
        <g
          transform={`translate(${P(-150, 150, 0)[0]} ${P(-150, 150, 0)[1]}) matrix(1 ${K} 0 1 0 0)`}
        >
          <circle
            cx="26"
            cy="18"
            r="9"
            fill="#fff"
            stroke={INK}
            strokeWidth="3"
          />
          <circle cx="26" cy="18" r="3.2" fill={INK} />
          <circle
            className="w3-blink"
            cx="52"
            cy="18"
            r="5"
            fill={LIME}
            stroke={INK}
            strokeWidth="2.6"
          />
          <path
            d="M96 18 H280"
            stroke={INK}
            strokeWidth="2"
            strokeDasharray="3 6"
            opacity=".5"
          />
        </g>
        {/* right face slot */}
        <g
          transform={`translate(${P(150, 150, 0)[0]} ${P(150, 150, 0)[1]}) matrix(1 ${-K} 0 1 0 0)`}
        >
          <rect x="70" y="9" width="150" height="18" rx="9" fill={INK} />
          <rect
            x="80"
            y="14"
            width="52"
            height="3"
            rx="1.5"
            fill={LIME}
            opacity=".9"
          />
        </g>

        {/* ---------------- dashed links on the floor ---------------- */}
        <g
          fill="none"
          stroke={INK}
          strokeWidth="2.4"
          strokeDasharray="7 7"
          strokeLinecap="round"
        >
          <polyline
            className="w3-dash"
            points={fmt([P(-85, -70), P(-85, 20), P(40, 20)])}
          />
          <polyline
            className="w3-dash"
            points={fmt([P(40, 20), P(40, -40), P(110, -40)])}
          />
          <polyline
            className="w3-dash"
            points={fmt([P(-20, 20), P(-20, 78)])}
          />
        </g>

        {/* ---------------- phone (dApp screen) ---------------- */}
        <g>
          {/* hard shadow on the dock */}
          <polygon
            points={fmt([P(-145, -86), P(20, -86), P(20, -70), P(-145, -70)])}
            fill={INK}
            opacity=".0"
          />
        </g>
        <Slab
          orient="L"
          o={P(-145, -70, 235)}
          depth={16}
          shape={(f, s) => (
            <rect
              width="120"
              height="235"
              rx="22"
              fill={f || INK}
              stroke={s}
              strokeWidth="3"
            />
          )}
        >
          <rect x="8" y="8" width="104" height="219" rx="16" fill={LIL2} />
          <rect
            x="8"
            y="8"
            width="104"
            height="219"
            rx="16"
            fill={`url(#${id("dots")})`}
            opacity=".5"
          />
          <rect x="38" y="8" width="44" height="13" rx="6.5" fill={INK} />
          {/* header: avatar + address */}
          <circle
            cx="29"
            cy="46"
            r="12"
            fill="#fff"
            stroke={INK}
            strokeWidth="2.4"
          />
          <path d="M23 46h4v-4h-4zM31 42h4v4h-4zM27 50h4v4h-4z" fill={INK} />
          <text
            x="46"
            y="44"
            fontFamily={MONO}
            fontSize="9.5"
            fontWeight="800"
            fill={INK}
          >
            0x7a…f3c
          </text>
          <rect
            x="46"
            y="49"
            width="34"
            height="11"
            rx="5.5"
            fill="#fff"
            stroke={INK}
            strokeWidth="1.6"
          />
          <text
            x="63"
            y="57.4"
            textAnchor="middle"
            fontFamily={MONO}
            fontSize="7"
            fontWeight="800"
            fill={INK}
          >
            MAINNET
          </text>
          {/* balance card */}
          <rect
            x="15"
            y="72"
            width="90"
            height="48"
            rx="11"
            fill="#fff"
            stroke={INK}
            strokeWidth="2.4"
          />
          <text
            x="24"
            y="87"
            fontFamily={MONO}
            fontSize="7"
            fontWeight="800"
            fill={INK}
            opacity=".6"
          >
            BALANCE
          </text>
          <text
            x="24"
            y="109"
            fontFamily={MONO}
            fontSize="16"
            fontWeight="800"
            fill={INK}
          >
            2.48 ETH
          </text>
          {/* connect button */}
          <g className="w3-btn">
            <rect x="15" y="132" width="90" height="28" rx="14" fill={INK} />
            <text
              className="w3-off"
              x="60"
              y="150.4"
              textAnchor="middle"
              fontFamily={MONO}
              fontSize="10.5"
              fontWeight="800"
              fill="#fff"
            >
              Connect
            </text>
            <g className="w3-on">
              <rect
                x="15"
                y="132"
                width="90"
                height="28"
                rx="14"
                fill={LIME}
                stroke={INK}
                strokeWidth="2.4"
              />
              <path
                d="M28 146 l4.4 4.6 l8 -9"
                fill="none"
                stroke={INK}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x="68"
                y="150.4"
                textAnchor="middle"
                fontFamily={MONO}
                fontSize="10"
                fontWeight="800"
                fill={INK}
              >
                Connected
              </text>
            </g>
          </g>
          {/* token rows */}
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(0 ${i * 28})`}>
              <rect
                x="15"
                y="170"
                width="90"
                height="23"
                rx="9"
                fill="#fff"
                stroke={INK}
                strokeWidth="2"
              />
              <circle
                cx="28"
                cy="181.5"
                r="7"
                fill={i ? INK : LIL1}
                stroke={INK}
                strokeWidth="2"
              />
              <rect
                x="40"
                y="176"
                width="34"
                height="4.5"
                rx="2.2"
                fill={INK}
              />
              <rect
                x="40"
                y="183.5"
                width="22"
                height="3.5"
                rx="1.7"
                fill={INK}
                opacity=".35"
              />
              <rect
                x="82"
                y="177"
                width="16"
                height="9"
                rx="4.5"
                fill={LIME}
                stroke={INK}
                strokeWidth="1.5"
              />
            </g>
          ))}
        </Slab>

        {/* ---------------- sign card ---------------- */}
        <g className="w3-float" style={{ animationDelay: "-1s" }}>
          {/* hard shadow on the dock */}
          <polygon
            points={fmt(
              [P(20, -76), P(20, 40), P(58, 40), P(58, -76)].map(
                (p) => [p[0] + 2, p[1] + 2] as Pt,
              ),
            )}
            fill={INK}
            opacity="0"
          />
          <Slab
            orient="R"
            o={P(20, 40, 150)}
            depth={12}
            shape={(f, s) => (
              <rect
                width="116"
                height="116"
                rx="28"
                fill={f || LIL1}
                stroke={s}
                strokeWidth="3"
              />
            )}
          >
            <rect
              width="116"
              height="116"
              rx="28"
              fill={`url(#${id("dots")})`}
              opacity=".22"
              transform="translate(0 0)"
              clipPath=""
            />
            <rect x="14" y="14" width="30" height="8" rx="4" fill={INK} />
            <rect
              x="14"
              y="26"
              width="18"
              height="5"
              rx="2.5"
              fill={INK}
              opacity=".35"
            />
            <path
              className="w3-sign"
              d="M24 76 C32 44 42 44 44 66 S56 92 64 62 S80 48 92 70"
              fill="none"
              stroke={INK}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 94 H94"
              stroke={INK}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="1 7"
            />
            <g className="w3-pop">
              <circle
                cx="90"
                cy="26"
                r="14"
                fill={LIME}
                stroke={INK}
                strokeWidth="3"
              />
              <path
                d="M83 26 l5 5.4 l9 -10"
                fill="none"
                stroke={INK}
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </Slab>
        </g>

        {/* ---------------- padlock (keyhole = Ethereum) ---------------- */}
        <g>
          {/* shackle first so the body hides its feet */}
          <g
            transform={`translate(${P(98, -101, 70)[0]} ${P(98, -101, 70)[1]}) ${ML}`}
          >
            <g className="w3-shackle">
              <path
                d="M14 36 V-26 C14 -64 50 -64 50 -26 V36"
                fill="none"
                stroke={INK}
                strokeWidth="13"
                strokeLinecap="round"
              />
            </g>
          </g>
          <Box
            x={90}
            y={-120}
            z={0}
            w={64}
            d={38}
            h={70}
            top="#fff"
            left={LIL1}
            right={LIL3}
            sw={3.2}
          />
          <g
            transform={`translate(${P(90, -82, 70)[0]} ${P(90, -82, 70)[1]}) ${ML}`}
          >
            <rect
              x="6"
              y="6"
              width="52"
              height="58"
              rx="6"
              fill="none"
              stroke={INK}
              strokeWidth="1.8"
              strokeDasharray="3 4"
              opacity=".45"
            />
            <EthGlyph cx={32} cy={36} h={32} mono fill={INK} />
            <g className="w3-glow">
              <circle cx="32" cy="36" r="26" fill={LIME} opacity=".55" />
              <EthGlyph cx={32} cy={36} h={32} mono fill={LIME} />
              <g transform="translate(32 36)">
                <path
                  d="M0 -17 L13 2 L0 9 L-13 2 Z"
                  fill="none"
                  stroke={INK}
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M0 -17 V9 M-13 2 H13 M0 12 L13 5 L0 20 L-13 5 Z"
                  fill="none"
                  stroke={INK}
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
              </g>
            </g>
          </g>
        </g>

        {/* ---------------- hex address plate ---------------- */}
        <g className="w3-float" style={{ animationDelay: "-2.2s" }}>
          <Slab
            orient="R"
            o={P(52, -8, 96)}
            depth={9}
            shape={(f, s) => (
              <rect
                width="156"
                height="50"
                rx="13"
                fill={f || "#fff"}
                stroke={s}
                strokeWidth="3"
              />
            )}
          >
            {[0, 1, 2, 3].map((i) => (
              <g key={i} transform={`translate(${11 + i * 36} 8)`}>
                <rect
                  width="31"
                  height="34"
                  rx="8"
                  fill={LIL1}
                  stroke={INK}
                  strokeWidth="2.4"
                />
                <text
                  ref={(el) => {
                    hexRefs.current[i] = el;
                  }}
                  x="15.5"
                  y="22.5"
                  textAnchor="middle"
                  fontFamily={MONO}
                  fontSize="14"
                  fontWeight="800"
                  fill={INK}
                >
                  {FINAL[i]}
                </text>
              </g>
            ))}
          </Slab>
        </g>

        {/* ---------------- wallet + coins ---------------- */}
        <g>
          {/* coins sit behind the wallet and hop out of it */}
          {[
            { x: -64, y: 44, z: 78, delay: 0, glyph: "eth" },
            { x: -22, y: 36, z: 92, delay: 0.55, glyph: "btc" },
            { x: 8, y: 54, z: 70, delay: 1.1, glyph: "sol" },
          ].map((c, i) => (
            <g
              key={i}
              className="w3-coin"
              style={{ animationDelay: `${c.delay}s` }}
            >
              <Slab
                orient="L"
                o={P(c.x, c.y, c.z)}
                depth={8}
                shape={(f, s) => (
                  <circle
                    cx="22"
                    cy="22"
                    r="22"
                    fill={f || "#fff"}
                    stroke={s}
                    strokeWidth="3"
                  />
                )}
              >
                <path
                  d="M22 0 A22 22 0 0 1 22 44 Z"
                  fill={LIL2}
                  opacity=".9"
                  clipPath=""
                />
                <circle
                  cx="22"
                  cy="22"
                  r="22"
                  fill="none"
                  stroke={INK}
                  strokeWidth="3"
                />
                {c.glyph === "eth" && (
                  <EthGlyph cx={22} cy={22} h={26} mono fill={INK} />
                )}
                {c.glyph === "btc" && <BtcGlyph cx={22} cy={22} s={0.0128} />}
                {c.glyph === "sol" && <SolGlyph cx={22} cy={22} s={0.082} />}
              </Slab>
            </g>
          ))}
          <Box
            x={-50}
            y={60}
            z={0}
            w={84}
            d={46}
            h={54}
            top={LIL1}
            left={LIL3}
            right={LIL2}
            sw={3.2}
          />
          <g
            transform={`translate(${P(-50, 106, 54)[0]} ${P(-50, 106, 54)[1]}) ${ML}`}
          >
            <path
              d="M8 14 H76"
              stroke={INK}
              strokeWidth="2"
              strokeDasharray="3 4"
              opacity=".5"
            />
            <rect
              x="46"
              y="18"
              width="38"
              height="26"
              rx="10"
              fill={LIL1}
              stroke={INK}
              strokeWidth="3"
            />
            <circle
              cx="60"
              cy="31"
              r="5.2"
              fill="#fff"
              stroke={INK}
              strokeWidth="2.4"
            />
          </g>
        </g>

        {/* ---------------- swap arrows (floor) ---------------- */}
        <g transform={`translate(${P(34, 48)[0]} ${P(34, 48)[1]})`}>
          <g className="w3-float" style={{ animationDelay: "-0.5s" }}>
            <g transform={MF}>
              {/* hard shadow */}
              <g transform="translate(4 4)" fill={INK}>
                <polygon points="0,6 44,6 44,-3 74,13 44,29 44,20 0,20" />
                <polygon points="74,40 30,40 30,31 0,47 30,63 30,54 74,54" />
              </g>
              <g className="w3-arrA">
                <polygon
                  points="0,6 44,6 44,-3 74,13 44,29 44,20 0,20"
                  fill="#fff"
                  stroke={INK}
                  strokeWidth="3"
                />
              </g>
              <g className="w3-arrB">
                <polygon
                  points="74,40 30,40 30,31 0,47 30,63 30,54 74,54"
                  fill={LIME}
                  stroke={INK}
                  strokeWidth="3"
                />
              </g>
            </g>
          </g>
        </g>
      </g>

      {/* ---------------- floating bits (screen space) ---------------- */}
      {/* verified shield */}
      <g transform="translate(505 262)">
        <g className="w3-float" style={{ animationDelay: "-3s" }}>
          <g transform={MR}>
            <g className="w3-shield">
              <path
                d="M0 -30 L26 -21 V6 C26 22 12 32 0 38 C-12 32 -26 22 -26 6 V-21 Z"
                fill={INK}
                transform="translate(5 6)"
              />
              <path
                d="M0 -30 L26 -21 V6 C26 22 12 32 0 38 C-12 32 -26 22 -26 6 V-21 Z"
                fill="#fff"
                stroke={INK}
                strokeWidth="3.4"
                strokeLinejoin="round"
              />
              <path
                d="M0 -21 L17 -15 V5 C17 15 8 22 0 26 C-8 22 -17 15 -17 5 V-15 Z"
                fill={INK}
              />
              <path
                d="M-8 3 l6 6 l11 -13"
                fill="none"
                stroke={LIME}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </g>
      </g>

      {/* code tag */}
      <g transform="translate(366 74)">
        <g className="w3-float" style={{ animationDelay: "-1.6s" }}>
          <Slab
            orient="L"
            o={[0, 0]}
            depth={9}
            shape={(f, s) => (
              <rect
                width="214"
                height="46"
                rx="14"
                fill={f || INK}
                stroke={s}
                strokeWidth="3"
              />
            )}
          >
            <circle cx="20" cy="23" r="4" fill="#ff6b6b" />
            <circle cx="33" cy="23" r="4" fill="#ffd93d" />
            <circle cx="46" cy="23" r="4" fill={LIME} />
            <text
              x="62"
              y="28.5"
              fontFamily={MONO}
              fontSize="15"
              fontWeight="800"
              fill={LIME}
            >
              {codeLabel}
            </text>
            <rect
              className="w3-type"
              x="60"
              y="11"
              width="146"
              height="25"
              fill={INK}
            />
            <rect
              className="w3-blink"
              x="62"
              y="14"
              width="2.5"
              height="19"
              fill={LIME}
              opacity="0"
            />
          </Slab>
        </g>
      </g>

      <Sparkle x={86} y={118} s={1.1} delay={0} />
      <Sparkle x={640} y={214} s={0.9} delay={0.8} color="#fff" />
      <Sparkle x={612} y={640} s={1} delay={1.4} />
      <Sparkle x={116} y={560} s={0.8} delay={0.4} color="#fff" />
      <Sparkle x={300} y={34} s={0.7} delay={1.9} color="#fff" />
    </svg>
  );
}
