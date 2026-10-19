"use client";

import { useEffect, useId, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * Web3Hero — isometric hero illustration for a web3 UI component library.
 *
 * The idea: a UI library is a box of snap-in parts. A cube of component tiles sits at the
 * centre of a little "dev bench", wired to a trading terminal, a phone and a coin wallet.
 * One 6s loop tells the story: market ticks → click a tile → tiles light up → connect →
 * lock closes → coins land in the wallet.
 *
 * Usage:
 *   <Web3Hero />
 *   <Web3Hero width={560} speed={1.1} background={false} />
 *
 * Props:
 *   width       CSS width (default "100%")
 *   background  true = rounded violet panel, false = transparent (default true)
 *   bg          panel colour (default "#8f8cff")
 *   accent      highlight colour (default "#d6ff3d")
 *   speed       animation speed multiplier (default 1)
 *   codeLabel   text typed on the code tag (default "<Connect />")
 *   animated    default true (respects prefers-reduced-motion)
 *   className, style
 */

const K = 0.577;
const INK = "#0b0b17";
const WHITE = "#ffffff";
const PAPER = "#f4f2fb";
const GREY = "#dcd8ee";
const LIL1 = "#e4e1ff";
const LIL2 = "#bdb8ff";
const LIL3 = "#9d98ff";
const DEEP = "#6f68f0";
const WP1 = "#7b4fe6";
const WP3 = "#a07cf8";
const CORAL = "#ff6b81";
const GOLD = "#ffc62e";
const SANS =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

type Pt = [number, number];
type Orient = "L" | "R";
/** [tile fill, icon kind, icon arg] */
type TileDef = [string, string, arg?: string | number];

const P = (x: number, y: number, z = 0): Pt => [x - y, K * (x + y) - z];
const fmt = (a: Pt[]) =>
  a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
const ML = `matrix(1 ${K} 0 1 0 0)`; // plane facing front-left
const MR = `matrix(1 ${-K} 0 1 0 0)`; // plane facing front-right
const MF = `matrix(1 ${K} -1 ${K} 0 0)`; // floor (x → right-down, y → left-down)
const at = (o: Pt) => `translate(${o[0].toFixed(1)} ${o[1].toFixed(1)})`;
const facePt = (orient: Orient, o: Pt, u: number, v: number): Pt => [
  o[0] + u,
  o[1] + (orient === "L" ? K * u : -K * u) + v,
];

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
  /** optional mask ref applied to the top face (used to cut real holes in it) */
  topMask?: string;
}

function Box({
  x,
  y,
  z = 0,
  w,
  d,
  h,
  top,
  left,
  right,
  sw = 3,
  topMask,
}: BoxProps) {
  const Tp = [
    P(x, y, z + h),
    P(x + w, y, z + h),
    P(x + w, y + d, z + h),
    P(x, y + d, z + h),
  ];
  const Lp = [
    P(x, y + d, z + h),
    P(x + w, y + d, z + h),
    P(x + w, y + d, z),
    P(x, y + d, z),
  ];
  const Rp = [
    P(x + w, y + d, z + h),
    P(x + w, y, z + h),
    P(x + w, y, z),
    P(x + w, y + d, z),
  ];
  const s = { stroke: INK, strokeWidth: sw, strokeLinejoin: "round" as const };
  return (
    <g>
      <polygon points={fmt(Lp)} fill={left} {...s} />
      <polygon points={fmt(Rp)} fill={right} {...s} />
      <polygon
        points={fmt(Tp)}
        fill={top}
        {...s}
        mask={topMask ? `url(#${topMask})` : undefined}
      />
    </g>
  );
}

/**
 * Extruded flat shape standing on a plane. shape(fill, stroke, strokeWidth) draws it in
 * face coordinates. With a coloured `edge` the thickness gets a clean ink contour.
 */
interface SlabProps {
  orient: Orient;
  o: Pt;
  depth: number;
  shape: (
    fill: string | null,
    stroke: string,
    strokeWidth: number,
  ) => ReactNode;
  children?: ReactNode;
  step?: number;
  edge?: string;
}

function Slab({
  orient,
  o,
  depth,
  shape,
  children,
  step = 2,
  edge = INK,
}: SlabProps) {
  const M = orient === "L" ? ML : MR;
  const dx = orient === "L" ? 1 : -1;
  const layers: number[] = [];
  for (let i = depth; i >= step; i -= step) layers.push(i);
  const coloured = edge !== INK;
  return (
    <g transform={at(o)}>
      {coloured &&
        layers.map((i) => (
          <g key={`o${i}`} transform={`translate(${dx * i} ${-K * i}) ${M}`}>
            {shape(INK, INK, 6)}
          </g>
        ))}
      {layers.map((i) => (
        <g key={i} transform={`translate(${dx * i} ${-K * i}) ${M}`}>
          {coloured ? shape(edge, edge, 0.4) : shape(INK, INK, 3)}
        </g>
      ))}
      <g transform={M}>
        {shape(null, INK, 3)}
        {children}
      </g>
    </g>
  );
}

/** A square hole in the floor with a visible bottom (children drawn in floor coords). */
interface PitProps {
  x: number;
  y: number;
  w: number;
  d: number;
  depth: number;
  clipId: string;
  children?: ReactNode;
}

function Pit({ x, y, w, d, depth, clipId, children }: PitProps) {
  const open = [P(x, y), P(x + w, y), P(x + w, y + d), P(x, y + d)];
  const bottom = [
    P(x, y, -depth),
    P(x + w, y, -depth),
    P(x + w, y + d, -depth),
    P(x, y + d, -depth),
  ];
  const wallA = [
    P(x, y, 0),
    P(x + w, y, 0),
    P(x + w, y, -depth),
    P(x, y, -depth),
  ];
  const wallB = [
    P(x, y + d, 0),
    P(x + w, y + d, 0),
    P(x + w, y + d, -depth),
    P(x, y + d, -depth),
  ];
  const o = P(x, y, -depth);
  return (
    <g>
      <clipPath id={clipId}>
        <polygon points={fmt(open)} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <polygon points={fmt(bottom)} fill={LIL1} />
        <g transform={`${at(o)} ${MF}`}>{children}</g>
        <polygon points={fmt(wallA)} fill={INK} />
        <polygon points={fmt(wallB)} fill={DEEP} />
      </g>
      <polygon
        points={fmt(open)}
        fill="none"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** Extruded flat shape on an arbitrary (tilted) plane. M = face matrix, dir = thickness step. */
interface TiltSlabProps {
  o: Pt;
  M: string;
  dir: Pt;
  depth: number;
  shape: (
    fill: string | null,
    stroke: string,
    strokeWidth: number,
  ) => ReactNode;
  children?: ReactNode;
  step?: number;
  edge?: string;
}

function TiltSlab({
  o,
  M,
  dir,
  depth,
  shape,
  children,
  step = 2,
  edge = INK,
}: TiltSlabProps) {
  const layers: number[] = [];
  for (let i = depth; i >= step; i -= step) layers.push(i);
  const coloured = edge !== INK;
  return (
    <g transform={at(o)}>
      {coloured &&
        layers.map((i) => (
          <g
            key={`o${i}`}
            transform={`translate(${dir[0] * i} ${dir[1] * i}) ${M}`}
          >
            {shape(INK, INK, 6)}
          </g>
        ))}
      {layers.map((i) => (
        <g key={i} transform={`translate(${dir[0] * i} ${dir[1] * i}) ${M}`}>
          {coloured ? shape(edge, edge, 0.4) : shape(INK, INK, 3)}
        </g>
      ))}
      <g transform={M}>
        {shape(null, INK, 3)}
        {children}
      </g>
    </g>
  );
}

/**
 * Rounded block standing on the floor (soft corners, like a dock or a power block).
 * Left side is light, right side is shaded; `children` are drawn on the top face in floor coords.
 */
interface RoundBoxProps {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  z0?: number;
  rx?: number;
  gid?: string;
  top?: string;
  solid?: string | null;
  children?: ReactNode;
}

function RoundBox({
  x,
  y,
  w,
  d,
  h,
  z0 = 0,
  rx = 14,
  gid,
  top = PAPER,
  solid = null,
  children,
}: RoundBoxProps) {
  const o = P(x, y, z0);
  const p = w / (w + d);
  const zs: number[] = [];
  for (let z = 0; z < h; z += 2) zs.push(z);
  const rect = (fill: string, stroke: string, sw: number) => (
    <rect
      width={w}
      height={d}
      rx={rx}
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
    />
  );
  return (
    <g>
      {!solid && (
        <defs>
          <linearGradient id={gid ?? ""} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor={WHITE} />
            <stop offset={Math.max(0, p - 0.012)} stopColor={WHITE} />
            <stop offset={Math.min(1, p + 0.012)} stopColor={GREY} />
            <stop offset="1" stopColor={GREY} />
          </linearGradient>
        </defs>
      )}
      {solid
        ? zs.map((z) => (
            <g key={z} transform={`${at([o[0], o[1] - z])} ${MF}`}>
              {rect(solid, solid, 3)}
            </g>
          ))
        : zs.map((z) => (
            <g key={`o${z}`} transform={`${at([o[0], o[1] - z])} ${MF}`}>
              {rect(INK, INK, 6)}
            </g>
          ))}
      {!solid &&
        zs.map((z) => (
          <g key={z} transform={`${at([o[0], o[1] - z])} ${MF}`}>
            {rect(`url(#${gid ?? ""})`, "none", 0)}
          </g>
        ))}
      <g transform={`${at([o[0], o[1] - h])} ${MF}`}>
        {rect(top, INK, 3)}
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
  fill?: string;
  multi?: boolean;
}

function EthGlyph({ cx, cy, h, fill = INK, multi = false }: EthGlyphProps) {
  const s = h / 417;
  const c = multi
    ? ["#343434", "#8C8C8C", "#3C3C3B", "#8C8C8C", "#141414", "#393939"]
    : Array(6).fill(fill);
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

/** Solana-style stacked plates, filled with the green→violet sweep. */
interface StackedGlyphProps {
  cx: number;
  cy: number;
  s: number;
  gradId: string;
}

function StackedGlyph({ cx, cy, s, gradId }: StackedGlyphProps) {
  return (
    <g
      transform={`translate(${cx - 198.85 * s} ${cy - 155.85 * s}) scale(${s})`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00ffa3" />
          <stop offset="1" stopColor="#dc1fff" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradId})`}
        stroke={INK}
        strokeWidth="36"
        strokeLinejoin="round"
        d="m64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8h-317.4c-5.8 0-8.7-7-4.6-11.1z"
      />
      <path
        fill={`url(#${gradId})`}
        stroke={INK}
        strokeWidth="36"
        strokeLinejoin="round"
        d="m64.6 3.8c2.5-2.4 5.8-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8h-317.4c-5.8 0-8.7-7-4.6-11.1z"
      />
      <path
        fill={`url(#${gradId})`}
        stroke={INK}
        strokeWidth="36"
        strokeLinejoin="round"
        d="m333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8h-317.4c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1z"
      />
    </g>
  );
}

/** Bitcoin mark: amber disc with the white ₿ punched out. */
function BtcCoin({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const s = (r * 2) / 2500;
  return (
    <g transform={`translate(${cx - 1250 * s} ${cy - 1250 * s}) scale(${s})`}>
      <circle
        cx="1250"
        cy="1250"
        r="1250"
        fill="#eab300"
        stroke={INK}
        strokeWidth={157}
      />
      <path
        fill={WHITE}
        transform="translate(0 4)"
        d="m1741.5 943.8c-16.1-167.4-160.6-223.5-343.2-239.5v-232.3h-141.3v226.1c-37.1 0-75.1.7-112.8 1.5v-227.6h-141.3l-.1 232.1c-30.6.6-60.7 1.2-90 1.2v-.7l-194.9-.1v151s104.4-2 102.6-.1c57.3 0 75.9 33.2 81.3 61.9v264.6c4 0 9.1.2 14.9 1h-14.9l-.1 370.7c-2.5 18-13.1 46.7-53.1 46.8 1.8 1.6-102.7 0-102.7 0l-28.1 168.8h184c34.2 0 67.9.6 100.9.8l.1 234.9h141.2v-232.4c38.7.8 76.2 1.1 112.9 1.1l-.1 231.3h141.3v-234.4c237.6-13.6 404.1-73.5 424.7-296.7 16.7-179.7-67.8-260-202.7-292.4 82.1-41.6 133.4-115.1 121.4-237.6zm-197.8 502.2c0 175.5-300.5 155.6-396.4 155.6v-311.3c95.9.2 396.4-27.3 396.4 155.7zm-65.8-439.1c0 159.7-250.8 141-330.6 141.1v-282.2c79.9 0 330.7-25.4 330.6 141.1z"
      />
    </g>
  );
}

interface PlugProps {
  x: number;
  y: number;
  a?: number;
}

function Plug({ x, y, a = 0 }: PlugProps) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <rect
        x="-9"
        y="-5.5"
        width="15"
        height="11"
        rx="3"
        fill={PAPER}
        stroke={INK}
        strokeWidth="2.6"
      />
      <path
        d="M6 -2.4 h5 M6 2.4 h5"
        stroke={INK}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M-4 -2 h6"
        stroke={INK}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity=".5"
      />
    </g>
  );
}

interface CableProps {
  d: string;
  delay?: number;
  lime: string;
}

function Cable({ d, delay = 0, lime }: CableProps) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth="6.4" />
      <path
        d={d}
        stroke="#7f7ae8"
        strokeWidth="1.7"
        opacity=".9"
        transform="translate(-1 -1)"
      />
      <path
        className="w3-flow"
        d={d}
        stroke={lime}
        strokeWidth="1.9"
        strokeDasharray="3 21"
        style={{ animationDelay: `${delay}s` }}
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* tiles for the component cube                                       */
/* ------------------------------------------------------------------ */
const T = 40; // tile size on the left face (and tile height everywhere)
const TR = 44; // right-face tiles are a little wider
const G = 5; // gap
const MG = 6; // margin between tiles and the cube edge
const SX = 3 * T + 2 * G + 2 * MG; // cube width (x)
const SY = 3 * TR + 2 * G + 2 * MG; // cube depth (y)
const SH = 3 * T + 2 * G + 2 * MG; // cube height
const HEX = "0123456789ABCDEF";
const FINAL = ["7F", "A3", "9C"];
const rnd = () => HEX[(Math.random() * 16) | 0] + HEX[(Math.random() * 16) | 0];

const TOP: TileDef[] = [
  ["lime", "cursor"],
  ["paper", "hex", 0],
  ["paper", "hex", 1],
  ["lil3", "toggle"],
  ["ink", "eth"],
  ["paper", "text", "+0.26"],
  ["paper", "check"],
  ["paper", "hex", 2],
  ["lil1", "shield"],
];
const LEFT: TileDef[] = [
  ["lil1", "text", "UI"],
  ["paper", "coin", "eth"],
  ["lil2", "coin", "btc"],
  ["paper", "coin", "sol"],
  ["lil3", "text", "+0.18"],
  ["paper", "wallet"],
  ["ink", "plug"],
  ["lime", "text", "0x"],
  ["paper", "key"],
];
const RIGHT: TileDef[] = [
  ["paper", "text", "DEV"],
  ["lil1", "bolt"],
  ["paper", "plus"],
  ["ink", "textlime", "WEB3"],
  ["paper", "lock"],
  ["lil2", "check"],
  ["paper", "chart"],
  ["lime", "text", "+1.47"],
  ["ink", "plug"],
];

type RegisterHex = (index: number) => (el: SVGTextElement | null) => void;

interface TileIconProps {
  kind: string;
  arg?: string | number;
  lime: string;
  registerHex: RegisterHex;
}

function TileIcon({ kind, arg, lime, registerHex }: TileIconProps) {
  const c = T / 2;
  switch (kind) {
    case "cursor":
      return (
        <path
          d="M-8 -11 L-8 10 L-2.5 5.5 L1.5 13.5 L5.5 11.5 L1.5 4 L9 4 Z"
          transform={`translate(${c} ${c})`}
          fill={INK}
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      );
    case "hex":
      return (
        <text
          ref={registerHex(Number(arg))}
          x={c}
          y={c + 5}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize="15"
          fontWeight="800"
          fill={INK}
        >
          {FINAL[Number(arg)] ?? FINAL[0]}
        </text>
      );
    case "toggle":
      return (
        <g transform={`translate(${c} ${c})`}>
          <rect x="-13" y="-7.5" width="26" height="15" rx="7.5" fill={INK} />
          <rect
            className="w3-on"
            x="-13"
            y="-7.5"
            width="26"
            height="15"
            rx="7.5"
            fill={lime}
            stroke={INK}
            strokeWidth="2.4"
          />
          <g className="w3-knob">
            <circle
              cx="-5.5"
              cy="0"
              r="5.2"
              fill={WHITE}
              stroke={INK}
              strokeWidth="2.2"
            />
          </g>
        </g>
      );
    case "eth":
      return (
        <g>
          <g className="w3-glow">
            <circle
              cx={c}
              cy={c}
              r="15.5"
              fill={lime}
              stroke={WHITE}
              strokeWidth="1.4"
            />
          </g>
          <g className="w3-ethw">
            <EthGlyph cx={c} cy={c} h={22} fill={WHITE} />
          </g>
          <g className="w3-ethk">
            <EthGlyph cx={c} cy={c} h={22} fill={INK} />
          </g>
        </g>
      );
    case "text": {
      const label = String(arg ?? "");
      return (
        <text
          x={c}
          y={c + 4.6}
          textAnchor="middle"
          fontFamily={SANS}
          fontSize={label.length > 3 ? 11 : 13}
          fontWeight="800"
          fill={INK}
        >
          {label}
        </text>
      );
    }
    case "textlime":
      return (
        <text
          x={c}
          y={c + 4.4}
          textAnchor="middle"
          fontFamily={SANS}
          fontSize="11"
          fontWeight="800"
          fill={lime}
        >
          {String(arg ?? "")}
        </text>
      );
    case "check":
      return (
        <path
          d={`M${c - 9} ${c} l6 7 l13 -14`}
          fill="none"
          stroke={INK}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case "plus":
      return (
        <path
          d={`M${c - 9} ${c} H${c + 9} M${c} ${c - 9} V${c + 9}`}
          stroke={INK}
          strokeWidth="4.4"
          strokeLinecap="round"
        />
      );
    case "shield":
      return (
        <g transform={`translate(${c} ${c})`}>
          <path
            d="M0 -13 L11 -9 V2 C11 9 5 13 0 15.5 C-5 13 -11 9 -11 2 V-9 Z"
            fill={INK}
          />
          <path
            d="M-5 1 l4 4 l7.5 -9"
            fill="none"
            stroke={lime}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    case "bolt":
      return (
        <path
          d="M2 -14 L-9 3 H-1 L-3 14 L9 -3 H1 Z"
          transform={`translate(${c} ${c})`}
          fill={INK}
          strokeLinejoin="round"
          stroke={INK}
          strokeWidth="2"
        />
      );
    case "key":
      return (
        <g
          transform={`translate(${c} ${c})`}
          fill="none"
          stroke={INK}
          strokeWidth="3.4"
          strokeLinecap="round"
        >
          <circle cx="-5" cy="-3" r="6.5" />
          <path d="M0 2 L11 13 M7 9 l4 -4" />
        </g>
      );
    case "wallet":
      return (
        <g transform={`translate(${c} ${c})`}>
          <rect
            x="-13"
            y="-9"
            width="26"
            height="19"
            rx="5"
            fill={WP1}
            stroke={INK}
            strokeWidth="2.4"
          />
          <rect
            x="3"
            y="-3"
            width="10"
            height="8"
            rx="3"
            fill={WP3}
            stroke={INK}
            strokeWidth="2"
          />
          <circle cx="7.5" cy="1" r="1.4" fill={INK} />
        </g>
      );
    case "link":
      return (
        <g
          transform={`translate(${c} ${c}) rotate(-35)`}
          fill="none"
          stroke={INK}
          strokeWidth="3.4"
        >
          <rect x="-13" y="-5.5" width="15" height="11" rx="5.5" />
          <rect x="-2" y="-5.5" width="15" height="11" rx="5.5" />
        </g>
      );
    case "chart":
      return (
        <g transform={`translate(${c} ${c})`} fill={INK}>
          <rect x="-12" y="2" width="6" height="10" rx="1.5" />
          <rect x="-3" y="-5" width="6" height="17" rx="1.5" />
          <rect x="6" y="-11" width="6" height="23" rx="1.5" />
        </g>
      );
    case "lock":
      return (
        <g transform={`translate(${c} ${c + 3})`}>
          <g className="w3-shackle">
            <path
              d="M-6 -4 V-9 A6 6 0 0 1 6 -9 V-4"
              fill="none"
              stroke={INK}
              strokeWidth="3.6"
              strokeLinecap="round"
            />
          </g>
          <rect x="-11" y="-5" width="22" height="16" rx="4" fill={INK} />
          <circle cx="0" cy="3" r="2.4" fill={lime} />
        </g>
      );
    case "plug":
      return (
        <g transform={`translate(${c} ${c})`}>
          <circle r="11.5" fill={PAPER} stroke={WHITE} strokeWidth="1" />
          <circle r="7" fill={INK} />
          <circle r="2.6" fill={lime} />
        </g>
      );
    case "coin":
      return (
        <g transform={`translate(${c} ${c})`}>
          <circle
            r="13.5"
            fill={arg === "btc" ? GOLD : arg === "eth" ? LIL1 : lime}
            stroke={INK}
            strokeWidth="2.4"
          />
          {arg === "btc" && <BtcGlyph cx={0} cy={0} s={0.0079} />}
          {arg === "eth" && <EthGlyph cx={0} cy={0} h={17} />}
          {arg === "sol" && <SolGlyph cx={0} cy={0} s={0.052} />}
        </g>
      );
    default:
      return null;
  }
}

function tileFill(name: string, lime: string) {
  return name === "lime"
    ? lime
    : name === "ink"
      ? INK
      : name === "lil1"
        ? LIL1
        : name === "lil2"
          ? LIL2
          : name === "lil3"
            ? LIL3
            : PAPER;
}

interface TileGridProps {
  tiles: TileDef[];
  lime: string;
  registerHex: RegisterHex;
  wave?: number;
  tw?: number;
  th?: number;
  shade?: number;
}

function TileGrid({
  tiles,
  lime,
  registerHex,
  wave = 0,
  tw = T,
  th = T,
  shade = 0,
}: TileGridProps) {
  return tiles.map((t, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    return (
      <g
        key={i}
        className="w3-t"
        style={{ animationDelay: `${wave + (col + row) * 0.11}s` }}
      >
        <g
          transform={`translate(${MG + col * (tw + G)} ${MG + row * (th + G)})`}
        >
          <rect
            width={tw}
            height={th}
            rx="9"
            fill={tileFill(t[0], lime)}
            stroke={INK}
            strokeWidth="2.6"
          />
          <g transform={`translate(${(tw - T) / 2} ${(th - T) / 2})`}>
            <TileIcon
              kind={t[1]}
              arg={t[2]}
              lime={lime}
              registerHex={registerHex}
            />
          </g>
          <path
            d={`M9 4.4 H${tw - 14}`}
            stroke={WHITE}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity=".6"
          />
          <rect
            x="3.5"
            y={th - 9}
            width={tw - 7}
            height="5.5"
            rx="2.75"
            fill={INK}
            opacity=".09"
          />
          {shade > 0 && (
            <rect width={tw} height={th} rx="9" fill={INK} opacity={shade} />
          )}
        </g>
      </g>
    );
  });
}

/* ------------------------------------------------------------------ */
/* trading terminal screen                                            */
/* ------------------------------------------------------------------ */
const SERIES = [
  0.28, 0.34, 0.3, 0.42, 0.38, 0.5, 0.45, 0.58, 0.52, 0.64, 0.6, 0.72, 0.66,
  0.8, 0.74, 0.9,
];
const CHX = 22;
const CHW = 166;
const CHT = 52;
const CHB = 112;
const stepX = CHW / (SERIES.length - 1);
const STEP_PATH = SERIES.map((v, i) => {
  const x = CHX + i * stepX;
  const y = CHB - v * (CHB - CHT);
  return i
    ? `H${x.toFixed(1)} V${y.toFixed(1)}`
    : `M${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(" ");
const LASTX = CHX + (SERIES.length - 1) * stepX;
const LASTY = CHB - SERIES[SERIES.length - 1] * (CHB - CHT);

function TerminalFace({ lime }: { lime: string }) {
  return (
    <g>
      {/* screen */}
      <rect
        x="12"
        y="12"
        width="191"
        height="130"
        rx="13"
        fill={lime}
        stroke={INK}
        strokeWidth="3"
      />
      <text
        x="22"
        y="26"
        fontFamily={SANS}
        fontSize="7.5"
        fontWeight="800"
        fill={INK}
        opacity=".65"
        letterSpacing=".6"
      >
        BTC / USDT
      </text>
      <text
        x="22"
        y="43"
        fontFamily={SANS}
        fontSize="16"
        fontWeight="800"
        fill={INK}
      >
        67,482.5
      </text>
      <rect x="155" y="20" width="40" height="17" rx="8.5" fill={INK} />
      <text
        x="175"
        y="32"
        textAnchor="middle"
        fontFamily={SANS}
        fontSize="9"
        fontWeight="800"
        fill={lime}
      >
        +2.84%
      </text>
      {/* grid */}
      <g stroke={INK} strokeOpacity=".16" strokeWidth="1">
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M22 ${CHT + i * 30} H196`} />
        ))}
      </g>
      {/* volume */}
      {SERIES.map((v, i) => {
        const h = 4 + ((i * 29) % 7) * 1.7;
        return (
          <rect
            key={i}
            className="w3-cndl"
            style={{ animationDelay: `${i * 0.04}s` }}
            x={CHX + i * stepX - 2.4}
            y={134 - h}
            width="4.8"
            height={h}
            rx="1"
            fill={INK}
            opacity=".78"
          />
        );
      })}
      {/* pixel chart */}
      <path
        className="w3-ma"
        d={STEP_PATH}
        fill="none"
        stroke={INK}
        strokeWidth="3.4"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
      {/* crosshair + live point */}
      <g className="w3-live">
        <path
          d={`M${LASTX} ${CHT - 4} V${CHB + 4} M22 ${LASTY} H${LASTX}`}
          stroke={INK}
          strokeWidth="1.3"
          strokeDasharray="3 3"
        />
        <rect
          x={LASTX - 5}
          y={LASTY - 5}
          width="10"
          height="10"
          rx="2"
          fill={INK}
        />
        <rect x={LASTX - 2} y={LASTY - 2} width="4" height="4" fill={lime} />
      </g>
      {/* body: d-pad, speaker dots, toggles */}
      <path
        d="M-13 -4.5 H-4.5 V-13 H4.5 V-4.5 H13 V4.5 H4.5 V13 H-4.5 V4.5 H-13 Z"
        transform="translate(38 180)"
        fill={INK}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <g fill={INK}>
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((c) => (
            <circle key={`${r}${c}`} cx={92 + c * 8} cy={172 + r * 8} r="1.7" />
          )),
        )}
      </g>
      <rect
        x="154"
        y="168"
        width="49"
        height="22"
        rx="11"
        fill={PAPER}
        stroke={INK}
        strokeWidth="2.8"
      />
      <circle
        className="w3-tgl"
        cx="165"
        cy="179"
        r="7"
        fill={WHITE}
        stroke={INK}
        strokeWidth="2.6"
      />
      <circle
        className="w3-tgl2"
        cx="191"
        cy="179"
        r="7"
        fill={LIL3}
        stroke={INK}
        strokeWidth="2.6"
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* phone                                                              */
/* ------------------------------------------------------------------ */
function PhoneFace({ lime }: { lime: string }) {
  return (
    <g>
      <rect
        x="6"
        y="6"
        width="56"
        height="148"
        rx="11"
        fill={WHITE}
        stroke={INK}
        strokeWidth="2.8"
      />
      <rect x="22" y="9" width="24" height="6" rx="3" fill={INK} />
      <text
        x="12"
        y="30"
        fontFamily={SANS}
        fontSize="8.5"
        fontWeight="800"
        fill={INK}
      >
        Balance
      </text>
      <text
        x="11"
        y="46"
        fontFamily={SANS}
        fontSize="9.4"
        fontWeight="800"
        fill={INK}
      >
        2.48 ETH
      </text>
      <rect
        x="12"
        y="52"
        width="28"
        height="11"
        rx="5.5"
        fill={lime}
        stroke={INK}
        strokeWidth="1.8"
      />
      <text
        x="26"
        y="60.4"
        textAnchor="middle"
        fontFamily={SANS}
        fontSize="7"
        fontWeight="800"
        fill={INK}
      >
        +4.2%
      </text>
      <rect
        x="11"
        y="70"
        width="46"
        height="44"
        rx="8"
        fill={WHITE}
        stroke={INK}
        strokeWidth="2"
      />
      <g className="w3-area">
        <path
          d="M14 108 L14 100 L21 92 L26 97 L33 80 L39 90 L45 78 L54 84 L54 108 Z"
          fill={INK}
        />
      </g>
      <g className="w3-btn">
        <rect x="11" y="122" width="46" height="20" rx="10" fill={INK} />
        <text
          className="w3-off"
          x="34"
          y="135.4"
          textAnchor="middle"
          fontFamily={SANS}
          fontSize="8.5"
          fontWeight="800"
          fill={WHITE}
        >
          Connect
        </text>
        <g className="w3-on">
          <rect
            x="11"
            y="122"
            width="46"
            height="20"
            rx="10"
            fill={lime}
            stroke={INK}
            strokeWidth="2.2"
          />
          <path
            d="M18 132 l3 3.2 l5.4 -6.2"
            fill="none"
            stroke={INK}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="40"
            y="135.2"
            textAnchor="middle"
            fontFamily={SANS}
            fontSize="6.6"
            fontWeight="800"
            fill={INK}
          >
            Linked
          </text>
        </g>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* the scene                                                          */
/* ------------------------------------------------------------------ */
interface Web3HeroProps {
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

export default function Web3Hero({
  width = "100%",
  background = true,
  bg = "#8f8cff",
  accent = "#d6ff3d",
  speed = 1,
  codeLabel = "<Connect />",
  animated = true,
  className,
  style,
}: Web3HeroProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (n: string) => `${n}-${uid}`;
  const hexRefs = useRef<Array<SVGTextElement | null>>([]);
  // Ref registration factory: children call it to stash their <text> node.
  // The write happens in React's commit phase, never during render.
  const registerHex = (index: number) => (el: SVGTextElement | null) => {
    hexRefs.current[index] = el;
  };
  const LIME = accent;

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
      set(FINAL.map((f, i) => (ph > 0.15 && ph < 0.24 + i * 0.04 ? rnd() : f)));
    }, 80);
    return () => clearInterval(iv);
  }, [animated, speed]);

  // ---- world layout ----
  const FL = 172; // floor half-size (base platform the whole scene stands on)
  const FRONT = 152; // the front-left edge is trimmed in, to tighten the base
  const TILE_H = 26; // tile thickness; the top face stays at z=0 so the scene sits on it
  // inner guide lines, inset 16 from each tile edge so they always follow the
  // trimmed front edge instead of overshooting it
  const IL = FL - 16;
  const IF = FRONT - 16;
  const cubeX = -21 - SX / 2;
  const cubeY = -47 - SY / 2;
  const cubeZ = 18; // hovers above the recessed cutout in the floor
  const cubeTop = cubeZ + SH;
  // cutout footprint on the floor: roomier on the screen-left/back edges,
  // tighter on the screen-right/front edges, with rounded corners
  const holeX = cubeX - 28; // screen-left edge (x−)
  const holeY = cubeY - 28; // back edge (y−)
  const holeW = SX + 28 + 14; // to the screen-right edge (x+14)
  const holeH = SY + 28 + 14; // to the front edge (y+14)
  const holeRx = 12; // corner radius in floor units

  const termLift = 24; // the terminal hovers a little above the tile
  const oTerm = P(-144, 120, 244 + termLift); // nudged forward (+y) from the back
  const oTop = P(cubeX, cubeY, cubeTop);
  const oLeft = P(cubeX, cubeY + SY, cubeTop);
  const oRight = P(cubeX + SX, cubeY + SY, cubeTop);

  // phone (back right): leans slightly back, hovering just above the tile
  const TH = 0.38;
  const sTh = Math.sin(TH);
  const cTh = Math.cos(TH);
  const PW = 64;
  const PH = 162;
  const phoneLift = 20; // so the cable has visible height to drop to the tile
  const phoneBL = P(99, -110, 0); // resting bottom-left, marks the shadow footprint
  const phoneFoot: Pt = [phoneBL[0], phoneBL[1] - phoneLift]; // lifted base
  const oPhone: Pt = [
    phoneFoot[0] + sTh * PH,
    phoneFoot[1] - (cTh + K * sTh) * PH,
  ];
  const phoneM = `matrix(1 ${K} ${-sTh} ${cTh + K * sTh} 0 0)`;
  const phoneDir: Pt = [cTh, -K * cTh + sTh];
  // bottom-centre of the phone, the plug sits exactly on that edge, pointing up the phone's axis
  const upLen = Math.hypot(sTh, cTh + K * sTh);
  const up: Pt = [sTh / upLen, -(cTh + K * sTh) / upLen];
  const phoneB: Pt = [phoneFoot[0] + PW / 2, phoneFoot[1] + (K * PW) / 2];
  const phonePlugAt: Pt = [phoneB[0] - up[0] * 11, phoneB[1] - up[1] * 11];
  const phonePlugAngle = (Math.atan2(up[1], up[0]) * 180) / Math.PI;
  const cableStart: Pt = [
    phonePlugAt[0] - up[0] * 9,
    phonePlugAt[1] - up[1] * 9,
  ];
  // the first cable beats are fixed offsets from the plug tail, so they follow
  // the phone wherever it sits; after that the run is anchored to the tile
  const drop1: Pt = [cableStart[0] - 0.6, cableStart[1] + 1.9];
  const drop2: Pt = [cableStart[0] - 3.2, cableStart[1] + 9.7];
  const drop3: Pt = [cableStart[0] - 4.8, cableStart[1] + 14.8];
  const drop4: Pt = [cableStart[0] - 6.4, cableStart[1] + 19.9];
  const drop5: Pt = [cableStart[0] - 0.3, cableStart[1] + 26.4];
  // switch / power block (front right)
  const SW = { x: 66, y: 70, w: 64, d: 50, h: 30 };
  const swSocket = facePt("R", P(SW.x + SW.w, SW.y + SW.d, SW.h), 22, 17);
  // the switch-side plug: cable enters along its 210° axis, so it meets the
  // back of the plug body (9 units back from centre)
  const swPlugAngle = 210;
  const swPlug: Pt = [swSocket[0] + 9, swSocket[1] + 5];
  const swPlugTail: Pt = [
    swPlug[0] - 9 * Math.cos((swPlugAngle * Math.PI) / 180),
    swPlug[1] - 9 * Math.sin((swPlugAngle * Math.PI) / 180),
  ];

  // cable ends (screen, relative to the scene origin)
  const plugL = facePt("L", oLeft, MG + T / 2, MG + 2 * (T + G) + T / 2);
  const plugR = facePt(
    "R",
    oRight,
    MG + 2 * (TR + G) + TR / 2,
    MG + 2 * (T + G) + T / 2,
  );
  // the cable plugs into the terminal's bottom edge (not the board face)
  const termEdge = facePt("R", oTerm, 36, 244); // on the bottom edge, clear of the corner radius
  const termPlug: Pt = [termEdge[0], termEdge[1] + 11]; // pressed up into that edge
  // the cord leaves from the back face of the plug (local x = -9), so the
  // cable starts flush with the plug body and runs straight down its axis
  const termTail: Pt = [termPlug[0], termPlug[1] + 9];
  const termDrop = P(-137, 85, 0); // where the cable first meets the tile
  const termDropA: Pt = [
    termTail[0],
    termTail[1] + (termDrop[1] - termTail[1]) * 0.34,
  ];
  const termDropB: Pt = [
    termDrop[0],
    termDrop[1] - (termDrop[1] - termTail[1]) * 0.34,
  ];

  const shadowSteps = Array.from({ length: 14 }, (_, i) => i * 2.6);

  return (
    <svg
      viewBox="0 0 760 800"
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
      aria-label="Isometric illustration of a web3 UI component library: a cube of UI tiles wired to a trading terminal, a phone and a switch"
      data-animated={animated ? "true" : "false"}
    >
      <title>Web3 UI component library</title>
      <style>{`
        [data-animated="true"] .w3-flow{animation:w3-flow calc(1.6s / var(--sp)) linear infinite}
        [data-animated="true"] .w3-t{animation:w3-t calc(6s / var(--sp)) ease-in-out infinite}
        [data-animated="true"] .w3-btn{animation:w3-btn calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-on{animation:w3-on calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-off{animation:w3-off calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-glow{animation:w3-glow calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-ethw{animation:w3-glow calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-ethk{animation:w3-ethk calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-shackle{animation:w3-shackle calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-knob{animation:w3-knob calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-type{animation:w3-type calc(6s / var(--sp)) steps(18,end) infinite}
        [data-animated="true"] .w3-float{animation:w3-float calc(4s / var(--sp)) ease-in-out infinite}
        [data-animated="true"] .w3-floatB{animation:w3-float calc(5s / var(--sp)) ease-in-out infinite reverse}
        [data-animated="true"] .w3-twinkle{animation:w3-twinkle calc(2.4s / var(--sp)) ease-in-out infinite}
        [data-animated="true"] .w3-cndl{animation:w3-cndl calc(6s / var(--sp)) both infinite}
        [data-animated="true"] .w3-ma{animation:w3-ma calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-live{animation:w3-blink calc(1.2s / var(--sp)) ease-in-out infinite}
        [data-animated="true"] .w3-blink{animation:w3-blink calc(1.6s / var(--sp)) ease-in-out infinite}
        [data-animated="true"] .w3-tgl{animation:w3-tgl calc(3s / var(--sp)) ease-in-out infinite}
        [data-animated="true"] .w3-tgl2{animation:w3-tgl2 calc(3s / var(--sp)) ease-in-out infinite}
        [data-animated="true"] .w3-area{animation:w3-area calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-cursor{animation:w3-cursor calc(6s / var(--sp)) ease-in-out infinite}
        [data-animated="true"] .w3-press{animation:w3-press calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-flash{animation:w3-flash calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-rock{animation:w3-rock calc(6s / var(--sp)) infinite}
        [data-animated="true"] .w3-led{animation:w3-led calc(6s / var(--sp)) infinite}
        .w3-flash,.w3-ethk{opacity:0}
        .w3-rock{transform:translateY(12px)}
        .w3-off{opacity:0}
        .w3-type{transform:scaleX(0)}
        .w3-knob{transform:translateX(11px)}
        .w3-tgl{transform:translateX(0)}
        .w3-t,.w3-twinkle,.w3-cndl,.w3-live,.w3-area,.w3-tgl,.w3-tgl2,.w3-press{transform-box:fill-box;transform-origin:center}
        .w3-cndl,.w3-area{transform-origin:50% 100%}
        .w3-type{transform-box:fill-box;transform-origin:right center}
        .w3-ma{stroke-dasharray:420}
        @keyframes w3-flow{to{stroke-dashoffset:-24}}
        @keyframes w3-t{0%,100%{transform:scale(1)}4%{transform:scale(1.1)}9%{transform:scale(1)}}
        @keyframes w3-btn{0%,38%{transform:translateY(0)}41%{transform:translateY(2.5px)}45%,100%{transform:translateY(0)}}
        @keyframes w3-on{0%,43%{opacity:0}45%,90%{opacity:1}96%,100%{opacity:0}}
        @keyframes w3-off{0%,43%{opacity:1}45%,90%{opacity:0}96%,100%{opacity:1}}
        @keyframes w3-glow{0%,54%{opacity:0}60%,90%{opacity:1}96%,100%{opacity:0}}
        @keyframes w3-ethk{0%,54%{opacity:1}60%,90%{opacity:0}96%,100%{opacity:1}}
        @keyframes w3-shackle{0%,46%{transform:translateY(-6px)}55%,90%{transform:translateY(0)}98%,100%{transform:translateY(-6px)}}
        @keyframes w3-knob{0%,40%{transform:translateX(0)}46%,90%{transform:translateX(11px)}96%,100%{transform:translateX(0)}}
        @keyframes w3-type{0%,6%{transform:scaleX(1)}34%{transform:scaleX(0)}90%{transform:scaleX(0)}96%,100%{transform:scaleX(1)}}
        @keyframes w3-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes w3-twinkle{0%,100%{opacity:.25;transform:scale(.55)}50%{opacity:1;transform:scale(1)}}
        @keyframes w3-cndl{0%,3%{transform:scaleY(0)}14%,92%{transform:scaleY(1)}98%,100%{transform:scaleY(0)}}
        @keyframes w3-ma{0%,2%{stroke-dashoffset:420}20%,92%{stroke-dashoffset:0}98%,100%{stroke-dashoffset:420}}
        @keyframes w3-blink{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes w3-tgl{0%,100%{transform:translateX(0)}50%{transform:translateX(0)}}
        @keyframes w3-tgl2{0%,100%{transform:translateX(0)}50%{transform:translateX(0)}}
        @keyframes w3-area{0%,40%{transform:scaleY(.15)}60%,92%{transform:scaleY(1)}98%,100%{transform:scaleY(.15)}}
        @keyframes w3-cursor{0%{transform:translate(34px,-26px)}9%{transform:translate(2px,-3px)}13%{transform:translate(0,0)}17%{transform:translate(2px,-3px)}90%{transform:translate(2px,-3px)}100%{transform:translate(34px,-26px)}}
        @keyframes w3-press{0%,12%{transform:translateY(0)}14%{transform:translateY(4px)}19%,100%{transform:translateY(0)}}
        @keyframes w3-flash{0%,13%{opacity:0}15%{opacity:.95}30%,100%{opacity:0}}
        @keyframes w3-rock{0%,36%{transform:translateY(0)}41%,90%{transform:translateY(12px)}96%,100%{transform:translateY(0)}}
        @keyframes w3-led{0%,38%{opacity:.25}42%,90%{opacity:1}96%,100%{opacity:.25}}
        @media (prefers-reduced-motion: reduce){
          [data-animated="true"] *{animation:none !important}
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
        <mask id={id("m1")}>
          <circle cx="110" cy="680" r="240" fill={`url(#${id("fade")})`} />
        </mask>
        <mask id={id("m2")}>
          <circle cx="680" cy="110" r="210" fill={`url(#${id("fade")})`} />
        </mask>
        <clipPath id={id("panel")}>
          <rect width="760" height="800" rx="40" />
        </clipPath>
        <clipPath id={id("floorTop")}>
          <polygon
            points={fmt([P(-FL, -FL), P(FL, -FL), P(FL, FRONT), P(-FL, FRONT)])}
          />
        </clipPath>
        {/* transparent cutout under the floating cube: white everywhere,
            black (hidden) over the cube footprint */}
        <mask
          id={id("holeMask")}
          maskUnits="userSpaceOnUse"
          x="-400"
          y="-400"
          width="1600"
          height="1600"
        >
          <rect x="-500" y="-500" width="1000" height="1000" fill="#fff" />
          <rect
            x={holeX}
            y={holeY}
            width={holeW}
            height={holeH}
            rx={holeRx}
            ry={holeRx}
            transform={MF}
            fill="#000"
          />
        </mask>
      </defs>

      {background && (
        <g clipPath={`url(#${id("panel")})`}>
          <rect width="760" height="800" fill={bg} />
          <rect
            width="760"
            height="800"
            fill={`url(#${id("dotsL")})`}
            opacity=".3"
            mask={`url(#${id("m1")})`}
          />
          <rect
            width="760"
            height="800"
            fill={`url(#${id("dotsL")})`}
            opacity=".26"
            mask={`url(#${id("m2")})`}
          />
        </g>
      )}

      <g transform="translate(380 480)" strokeLinejoin="round">
        {/* ============ floor ============ */}
        {shadowSteps.map((s, i) => (
          <polygon
            key={i}
            points={fmt(
              [
                P(-FL, -FL, -TILE_H),
                P(FL, -FL, -TILE_H),
                P(FL, FRONT, -TILE_H),
                P(-FL, FRONT, -TILE_H),
              ].map((p) => [p[0] + s, p[1] + s * 0.95] as Pt),
            )}
            fill={INK}
          />
        ))}
        <Box
          x={-FL}
          y={-FL}
          z={-TILE_H}
          w={2 * FL}
          d={FL + FRONT}
          h={TILE_H}
          top={PAPER}
          left={WHITE}
          right={GREY}
          sw={3.5}
          topMask={id("holeMask")}
        />
        {/* side detailing: port + status LED + guide on the front-left face,
            a recessed slot with a lime accent on the front-right face */}
        <g transform={`${at(P(-FL, FRONT, 0))} ${ML}`}>
          <circle
            cx="30"
            cy={TILE_H / 2}
            r="6"
            fill={WHITE}
            stroke={INK}
            strokeWidth="2.4"
          />
          <circle cx="30" cy={TILE_H / 2} r="2.2" fill={INK} />
          <circle
            className="w3-blink"
            cx="62"
            cy={TILE_H / 2}
            r="3.6"
            fill={LIME}
            stroke={INK}
            strokeWidth="1.8"
          />
          <path
            d={`M112 ${TILE_H / 2} H318`}
            stroke={INK}
            strokeWidth="1.8"
            strokeDasharray="3 6"
            strokeLinecap="round"
            opacity=".45"
          />
        </g>
        <g transform={`${at(P(FL, FRONT, 0))} ${MR}`}>
          <rect
            x="76"
            y={(TILE_H - 13) / 2}
            width="152"
            height="13"
            rx="6.5"
            fill={INK}
          />
          <rect
            x="84"
            y={(TILE_H - 2.4) / 2}
            width="54"
            height="2.4"
            rx="1.2"
            fill={LIME}
          />
        </g>
        <polygon
          points={fmt([P(-IL, -IL), P(IL, -IL), P(IL, IF), P(-IL, IF)])}
          fill="none"
          stroke={INK}
          strokeWidth="1.5"
          opacity=".35"
        />

        <g
          stroke={INK}
          strokeWidth="1"
          opacity=".1"
          fill="none"
          mask={`url(#${id("holeMask")})`}
        >
          {[-86, 0, 86].map((v) => (
            <g key={v}>
              <polyline points={fmt([P(v, -IL), P(v, IF)])} />
              <polyline points={fmt([P(-IL, v), P(IL, v)])} />
            </g>
          ))}
        </g>
        {/* PCB pit (front) */}
        <Pit x={-56} y={60} w={92} d={66} depth={14} clipId={id("pit")}>
          <rect width="92" height="66" fill={LIL1} />
          <path
            d="M0 18 H18 L26 26 H52 M0 48 H30 L38 40 H92 M62 0 V16 M70 66 V50 M30 66 V54"
            stroke={INK}
            strokeWidth="2"
            fill="none"
            opacity=".5"
          />
          <rect x="24" y="14" width="36" height="36" rx="4" fill={INK} />
          <g fill={LIME}>
            {[0, 1, 2, 3, 4].map((r) =>
              [0, 1, 2, 3, 4].map((c) => (
                <circle
                  key={`${r}${c}`}
                  cx={30 + c * 6.2}
                  cy={20 + r * 6.2}
                  r="1.5"
                />
              )),
            )}
          </g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse
              key={i}
              cx="76"
              cy={12 + i * 7}
              rx="10"
              ry="3.6"
              fill={LIME}
              stroke={INK}
              strokeWidth="1.8"
            />
          ))}
          <rect
            x="6"
            y="54"
            width="9"
            height="6"
            rx="1.8"
            fill={CORAL}
            stroke={INK}
            strokeWidth="1.4"
          />
          <rect
            x="18"
            y="54"
            width="9"
            height="6"
            rx="1.8"
            fill={PAPER}
            stroke={INK}
            strokeWidth="1.4"
          />
        </Pit>

        {/* ============ trading terminal wall ============ */}
        <Slab
          orient="R"
          o={oTerm}
          depth={16}
          edge={LIL3}
          shape={(f, s, w) => (
            <rect
              width="262"
              height="244"
              rx="22"
              fill={f || PAPER}
              stroke={s}
              strokeWidth={w}
            />
          )}
        >
          {/* screen content scaled to match the larger face */}
          <g transform="scale(1.22)">
            <TerminalFace lime={LIME} />
          </g>
        </Slab>

        {/* ============ phone (back right), hovering above the tile ============ */}
        {/* soft shadow on the tile under the hovering phone */}
        <rect
          x={92}
          y={-114}
          width={72}
          height={16}
          rx={7}
          ry={7}
          transform={MF}
          fill={INK}
          opacity=".1"
        />
        <TiltSlab
          o={oPhone}
          M={phoneM}
          dir={phoneDir}
          depth={10}
          edge={LIL3}
          shape={(f, s, w) => (
            <rect
              width={PW}
              height={PH}
              rx="14"
              fill={f || PAPER}
              stroke={s}
              strokeWidth={w}
            />
          )}
        >
          <g transform={`scale(${PW / 68} ${PH / 172})`}>
            <PhoneFace lime={LIME} />
          </g>
        </TiltSlab>

        {/* ============ switch + socket (front right) ============ */}
        <RoundBox
          x={SW.x}
          y={SW.y}
          w={SW.w}
          d={SW.d}
          h={SW.h}
          rx={12}
          gid={id("gSw")}
        >
          <rect x="9" y="9" width="26" height="30" rx="7" fill={INK} />
          <g className="w3-rock">
            <rect
              x="11.5"
              y="11.5"
              width="21"
              height="14"
              rx="5"
              fill={PAPER}
              stroke={INK}
              strokeWidth="2"
            />
          </g>
          <circle cx="48" cy="24" r="4.4" fill={INK} />
          <circle className="w3-led" cx="48" cy="24" r="2.3" fill={LIME} />
        </RoundBox>
        <g transform={`${at(P(SW.x + SW.w, SW.y + SW.d, SW.h))} ${MR}`}>
          <circle cx="22" cy="17" r="9" fill={INK} />
          <circle
            cx="22"
            cy="17"
            r="9"
            fill="none"
            stroke={WHITE}
            strokeWidth="1.4"
            opacity=".8"
          />
          <circle cx="22" cy="17" r="3.2" fill={LIME} />
          <path
            d="M34 8 h8"
            stroke={INK}
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity=".5"
          />
        </g>
        {/* phone cable: leaves the plug on a curve, snakes along the tile,
            then curves up into the switch socket */}
        <Cable
          lime={LIME}
          delay={1.1}
          d={`M${cableStart[0].toFixed(1)} ${cableStart[1].toFixed(1)} C ${fmt([drop1, drop2, drop3])} C ${fmt([drop4, drop5, [212, 46]])} C 202.5,50.4 174.7,47.0 159.9,56.3 C 145.1,65.5 139.1,89.7 123.1,101.5 C 107.1,113.3 76.4,122.6 64.0,127.0 C 51.6,131.4 50.8,129.2 ${swPlugTail[0].toFixed(1)} ${swPlugTail[1].toFixed(1)}`}
        />
        <Plug x={phonePlugAt[0]} y={phonePlugAt[1]} a={phonePlugAngle} />
        <Plug x={swPlug[0]} y={swPlug[1]} a={swPlugAngle} />

        {/* ============ component cube, hovering over a floor cutout ============ */}
        {/* plinth: part of the cube assembly, hovers with it above the cutout */}
        <RoundBox
          x={cubeX - 8}
          y={cubeY - 8}
          z0={cubeZ - 10}
          w={SX + 16}
          d={SY + 16}
          h={10}
          rx={16}
          gid={id("gPlinth")}
          top={WHITE}
        />
        {/* rim of the transparent cutout (the floor top is masked here) */}
        <rect
          x={holeX}
          y={holeY}
          width={holeW}
          height={holeH}
          rx={holeRx}
          ry={holeRx}
          transform={MF}
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <RoundBox
          x={cubeX}
          y={cubeY}
          z0={cubeZ}
          w={SX}
          d={SY}
          h={SH}
          rx={9}
          solid={INK}
          top={INK}
        />
        <g transform={`${at(oLeft)} ${ML}`}>
          <TileGrid
            tiles={LEFT}
            lime={LIME}
            registerHex={registerHex}
            wave={1.2}
            shade={0.03}
          />
        </g>
        <g transform={`${at(oRight)} ${MR}`}>
          <TileGrid
            tiles={RIGHT}
            lime={LIME}
            registerHex={registerHex}
            wave={1.45}
            tw={TR}
            shade={0.13}
          />
        </g>
        <g transform={`${at(oTop)} ${MF}`}>
          <TileGrid
            tiles={TOP}
            lime={LIME}
            registerHex={registerHex}
            wave={0.95}
            th={TR}
          />
        </g>
        {/* terminal cable: plugs up into the terminal's bottom edge, lies on
            the tile, then bends up into the cube's plug (drawn over the
            plinth so the run stays continuous) */}
        <Cable
          lime={LIME}
          d={`M${termTail[0].toFixed(1)} ${termTail[1].toFixed(1)} C ${termDropA[0].toFixed(1)} ${termDropA[1].toFixed(1)}, ${termDropB[0].toFixed(1)} ${termDropB[1].toFixed(1)}, ${termDrop[0].toFixed(1)} ${termDrop[1].toFixed(1)} C ${fmt([P(-131, 93), P(-113, 88), P(-104, 66)])} C ${fmt([P(-104, 50), P(-96, 52), P(-90, 52)])} C -130 -34, -116 -46, ${(plugL[0] - 14.2).toFixed(1)} ${(plugL[1] + 5.7).toFixed(1)}`}
        />
        <Plug x={termPlug[0]} y={termPlug[1]} a={-90} />
        <Plug x={plugL[0] - 6} y={plugL[1] + 2} a={-24} />
        <Plug x={plugR[0] + 6} y={plugR[1] + 2} a={210} />

        {/* ============ floating tile being placed ============ */}
        <g className="w3-float" style={{ animationDelay: "-1.4s" }}>
          <g className="w3-press">
            <RoundBox
              x={-48}
              y={-80}
              z0={cubeTop + 40}
              w={40}
              d={40}
              h={32}
              rx={9}
              solid={LIL3}
              top={LIME}
            />
            {/* top face: the ETH mark being placed, with its value */}
            <g transform={`${at(P(-48, -80, cubeTop + 72))} ${MF}`}>
              <EthGlyph cx={20} cy={17} h={22} fill={INK} />
              <text
                x="20"
                y="36"
                textAnchor="middle"
                fontFamily={SANS}
                fontSize="10"
                fontWeight="800"
                fill={INK}
              >
                +1.47
              </text>
            </g>
            {/* matching coin marks on the two visible side faces, each on the
                same green plate + dark border as the top face */}
            <g transform={`${at(P(-48, -40, cubeTop + 72))} ${ML}`}>
              <rect
                width="40"
                height="32"
                rx="9"
                fill={GREY}
                stroke={INK}
                strokeWidth="3"
              />
              <StackedGlyph
                cx={20}
                cy={16}
                s={15 / 311.7}
                gradId={id("stackGrad")}
              />
            </g>
            <g transform={`${at(P(-8, -40, cubeTop + 72))} ${MR}`}>
              <rect
                width="40"
                height="32"
                rx="9"
                fill={PAPER}
                stroke={INK}
                strokeWidth="3"
              />
              <BtcCoin cx={20} cy={16} r={13.5} />
            </g>
          </g>
        </g>
        <g transform={at(P(-8, -84, cubeTop + 86))}>
          <g className="w3-cursor">
            <path
              d="M0 0 L0 24 L6.5 18.5 L11.5 29 L16 26.8 L11 16.5 L19.5 16.5 Z"
              fill={WHITE}
              stroke={INK}
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </g>

      {/* ============ floating bits (screen space) ============ */}
      <g transform="translate(436 66)">
        <g className="w3-float" style={{ animationDelay: "-1.6s" }}>
          <Slab
            orient="L"
            o={[0, 0]}
            depth={9}
            shape={(f, s, w) => (
              <rect
                width="200"
                height="44"
                rx="13"
                fill={f || INK}
                stroke={s}
                strokeWidth={w}
              />
            )}
          >
            <circle cx="18" cy="22" r="3.8" fill={CORAL} />
            <circle cx="30" cy="22" r="3.8" fill={GOLD} />
            <circle cx="42" cy="22" r="3.8" fill={LIME} />
            <text
              x="56"
              y="27.5"
              fontFamily={MONO}
              fontSize="14.5"
              fontWeight="800"
              fill={LIME}
            >
              {codeLabel}
            </text>
            <rect
              className="w3-type"
              x="54"
              y="10"
              width="100"
              height="25"
              fill={INK}
            />
          </Slab>
        </g>
      </g>

      {/* hovering coins */}
    </svg>
  );
}
