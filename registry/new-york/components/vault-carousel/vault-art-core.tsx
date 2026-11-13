"use client";

import { motion } from "motion/react";
import { createContext, useContext, useId, type ReactNode } from "react";

/* ------------------------------------------------------------------------ */
/* Illustrations                                                             */
/* ------------------------------------------------------------------------ */

// Isometric "clay" objects: rounded off-white blocks with soft gradient
// faces, thin navy outlines, one accent per card and a narrow dark sliver on
// the far-right edge. 240x300 viewBox centred on x = 120; iso ratio 2:1.
export const INK_C = "#1b1d29";
export const FACE_TOP = "#fbfaf7";
export const EASE = [0.2, 0.8, 0.2, 1] as const;

export const ACCENT = {
  base: "#1490f7",
  light: "#36a8ff",
  deep: "#0a7be8",
  soft: "#c4dbf7",
  lip: "#a9cbf5",
};
export type Accent = typeof ACCENT;
export type Skin = "neutral" | "accent" | "dark" | "glass" | "cube";

// Side shading per material: smooth light-left -> shadow-right gradients.
export const sideStops = (skin: Skin, a: Accent): [number, string][] => {
  switch (skin) {
    case "neutral":
      return [
        [0, "#ffffff"],
        [0.45, "#ece8e0"],
        [0.6, "#e9e5dc"],
        [1, "#cbc4b6"],
      ];
    case "accent":
      return [
        [0, a.light],
        [0.55, a.base],
        [1, a.deep],
      ];
    case "dark":
      return [
        [0, "#3b3c46"],
        [0.3, "#26272e"],
        [1, "#15161c"],
      ];
    case "glass":
      return [
        [0, "#e3edff"],
        [1, "#a9c3ef"],
      ];
    case "cube":
      return [
        [0, "#ffffff"],
        [0.5, "#eeeeee"],
        [1, "#d9d9d9"],
      ];
  }
};

export const skinColors = (a: Accent) => ({
  neutral: { top: FACE_TOP, sides: ["#ffffff", "#cbc4b6"], alpha: 1 },
  accent: { top: a.light, sides: [a.light, a.deep], alpha: 1 },
  dark: { top: "#3b3c46", sides: ["#33343d", "#15161c"], alpha: 1 },
  glass: { top: "#dbe8ff", sides: ["#bdd7ff", "#9dc0ff"], alpha: 0.8 },
  cube: { top: "#ffffff", sides: ["#eeeeee", "#d9d9d9"], alpha: 1 },
});

// Outline weight: the shared base plus a per-art width. Each illustration is
// wrapped in a Zoom transform, so the width is divided by that art's scale to
// keep every outline ~2.4 px at the card's display size (DETAIL ~60% of it).
export const STROKE = {
  stroke: INK_C,
  strokeLinejoin: "round",
  strokeLinecap: "round",
} as const;
export const SW_BASE = 1.9;
export const detail = (sw: number) =>
  ({ ...STROKE, strokeWidth: sw * 0.6 }) as const;

export interface ArtState {
  id: string;
  /** Latched once the card has been seen: the pieces assemble. */
  drawn: boolean;
  /** Hovered, focused or open: per-kind micro-interactions play. */
  live: boolean;
  /** On screen: idle loops (float, glow) run only then. */
  onScreen: boolean;
  motionAllowed: boolean;
  accent: Accent;
  /** Outline width in local units (compensates the art's Zoom scale). */
  sw: number;
}

export const ArtContext = createContext<ArtState | null>(null);

export function useArt() {
  const art = useContext(ArtContext);
  if (!art) throw new Error("FeatureArt parts must render inside <FeatureArt>");
  return art;
}

export const side = (id: string, skin: Skin) => `url(#${id}-side-${skin})`;
export const pts = (p: number[][]) =>
  p.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`);

// Entrance: a piece springs into place (from below, or from above when
// `from` is negative). Reduced motion renders it in place.
export function Rise({
  children,
  delay = 0,
  from = 16,
}: {
  children: ReactNode;
  delay?: number;
  from?: number;
}) {
  const { drawn, motionAllowed } = useArt();
  return (
    <motion.g
      initial={motionAllowed ? { y: from, opacity: 0 } : false}
      animate={drawn || !motionAllowed ? { y: 0, opacity: 1 } : undefined}
      transition={
        motionAllowed
          ? {
              y: { type: "spring", stiffness: 240, damping: 22, delay },
              opacity: { duration: 0.25, delay },
            }
          : { duration: 0 }
      }
    >
      {children}
    </motion.g>
  );
}

// Levitating hero object: lifts while live, bobs while on screen. Two layers
// so the lift springs smoothly instead of restarting the bob keyframes.
export function Float({
  children,
  lift = 10,
}: {
  children: ReactNode;
  lift?: number;
}) {
  const { live, onScreen, motionAllowed } = useArt();
  return (
    <motion.g
      initial={false}
      animate={{ y: live && motionAllowed ? -lift : 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <motion.g
        initial={false}
        animate={
          onScreen && motionAllowed
            ? {
                y: [0, -4, 0],
                transition: {
                  duration: 3.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
            : { y: 0 }
        }
      >
        {children}
      </motion.g>
    </motion.g>
  );
}

// Four-point ink sparkles that twinkle in while live.
export function Sparkles({
  at,
}: {
  at: [x: number, y: number, size: number][];
}) {
  const { live, motionAllowed } = useArt();
  return (
    <>
      {at.map(([x, y, s], i) => (
        <motion.path
          key={i}
          d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`}
          className="fill-[#1b1d29] dark:fill-neutral-200"
          initial={false}
          animate={
            live
              ? {
                  scale: motionAllowed ? [0, 1.25, 1] : 1,
                  rotate: motionAllowed ? [0, 90] : 0,
                  opacity: 1,
                }
              : { scale: 0, rotate: 0, opacity: 0 }
          }
          transition={{
            duration: motionAllowed ? 0.6 : 0,
            delay: live && motionAllowed ? 0.25 + i * 0.12 : 0,
            ease: EASE,
          }}
        />
      ))}
    </>
  );
}

export function Shadow({ cy, rx, ry }: { cy: number; rx: number; ry: number }) {
  const { id } = useArt();
  // Offset to the lower right of the object, tinted with the accent.
  return (
    <ellipse cx={150} cy={cy} rx={rx} ry={ry} fill={`url(#${id}-shadow)`} />
  );
}

// Per-art magnifier: scales the illustration so the object fills ~75-80% of
// the art box. (`from` is the local y that lands on `to`.) Strokes are drawn
// with a compensated width (`sw`) so the line weight stays uniform.
export function Zoom({
  s,
  from,
  to,
  children,
}: {
  s: number;
  from: number;
  to: number;
  children: ReactNode;
}) {
  return (
    <g
      transform={`translate(${(120 * (1 - s)).toFixed(2)} ${(to - from * s).toFixed(2)}) scale(${s})`}
    >
      {children}
    </g>
  );
}

// Contour of the rounded square [inset, w - inset]^2 on a box's top face,
// projected to screen; (x, y) is the top-face centre.
export function topContour(
  x: number,
  y: number,
  w: number,
  r: number,
  inset = 0,
) {
  const lo = inset + r;
  const hi = w - inset - r;
  const corners = [
    [hi, lo, -90],
    [hi, hi, 0],
    [lo, hi, 90],
    [lo, lo, 180],
  ];
  const out: number[][] = [];
  for (const [cx, cy, start] of corners)
    for (let s = 0; s <= 6; s++) {
      const t = ((start + s * 15) * Math.PI) / 180;
      const a = cx + r * Math.cos(t);
      const b = cy + r * Math.sin(t);
      out.push([x + a - b, y - w / 2 + (a + b) / 2]);
    }
  return out;
}

// Rounded iso box: (x, y) is the top-face centre, w its half-width, h the
// height. Decorations sit in each face's plane in local units (0..w across,
// 0..h down; the top face is a 0..w square). White blocks get a narrow dark
// sliver hugging the far-right vertical edge, like the reference set.
export function IsoBox({
  x,
  y,
  w,
  h,
  r = 7,
  skin = "neutral",
  rightSkin,
  bevel = true,
  top,
  topDecor,
  leftDecor,
  rightDecor,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  skin?: Skin;
  rightSkin?: Skin;
  bevel?: boolean;
  top?: string;
  topDecor?: ReactNode;
  leftDecor?: ReactNode;
  rightDecor?: ReactNode;
}) {
  const { id, accent, sw } = useArt();
  const uid = `b${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const c = skinColors(accent)[skin];
  const topOutline = topContour(x, y, w, r);
  // Visible side = the front chain of the contour (rightmost -> leftmost),
  // extruded down by h.
  let iMax = 0;
  let iMin = 0;
  topOutline.forEach(([px], i) => {
    if (px > topOutline[iMax][0]) iMax = i;
    if (px < topOutline[iMin][0]) iMin = i;
  });
  const front = topOutline.slice(iMax, iMin + 1);
  const down = front.map(([px, py]) => [px, py + h]).reverse();
  const sideD = `M${pts([...front, ...down]).join(" L")} Z`;
  // Right face alone, for a different material (e.g. glossy black).
  let iFront = 0;
  front.forEach(([, py], i) => {
    if (py > front[iFront][1]) iFront = i;
  });
  const rightChain = front.slice(0, iFront + 1);
  const rightDown = rightChain.map(([px, py]) => [px, py + h]).reverse();
  const rightD = `M${pts([...rightChain, ...rightDown]).join(" L")} Z`;
  const [xr, yr] = topOutline[iMax];
  return (
    <g {...STROKE} strokeWidth={sw} opacity={c.alpha}>
      {skin === "neutral" && (
        <clipPath id={`${id}-${uid}`}>
          <path d={sideD} />
        </clipPath>
      )}
      <path d={sideD} fill={side(id, skin)} />
      {rightSkin && <path d={rightD} fill={side(id, rightSkin)} />}
      {skin === "neutral" && !rightSkin && (
        <g clipPath={`url(#${id}-${uid})`}>
          <rect
            x={xr - 3.4}
            y={yr + 1}
            width={3.4}
            height={h - 2}
            rx={1.7}
            fill={`url(#${id}-sliver)`}
            stroke="none"
          />
        </g>
      )}
      <path d={`M${pts(topOutline).join(" L")} Z`} fill={top ?? c.top} />
      {bevel && (
        <path
          d={`M${pts(topContour(x, y, w, Math.max(r - 2, 2), 4)).join(" L")} Z`}
          fill="none"
          {...detail(sw)}
          strokeOpacity={0.4}
        />
      )}
      {topDecor && (
        <g transform={`matrix(1 0.5 -1 0.5 ${x} ${y - w / 2})`}>{topDecor}</g>
      )}
      {leftDecor && (
        <g transform={`matrix(1 0.5 0 1 ${x - w} ${y})`}>{leftDecor}</g>
      )}
      {rightDecor && (
        <g transform={`matrix(1 -0.5 0 1 ${x} ${y + w / 2})`}>{rightDecor}</g>
      )}
    </g>
  );
}

// Phone with a fingerprint screen on a round pedestal; the phone lifts and a
// scan bar sweeps the screen while live. Drawn in the user-supplied style
// (pedestal geometry matches the ID card art).
export function FingerprintArt() {
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

export function VaultArt() {
  const { id, accent: a, live, motionAllowed, sw } = useArt();
  return (
    <>
      <Shadow cy={252} rx={100} ry={26} />
      <Rise>
        <IsoBox
          x={120}
          y={186}
          w={78}
          h={10}
          r={10}
          skin="accent"
          bevel={false}
        />
      </Rise>
      <Rise delay={0.1} from={-24}>
        <IsoBox
          x={120}
          y={114}
          w={58}
          h={72}
          r={9}
          leftDecor={
            <>
              <rect x={7} y={8} width={44} height={56} rx={5} fill={FACE_TOP} />
              <rect
                x={10}
                y={11}
                width={38}
                height={50}
                rx={3}
                fill="none"
                {...detail(sw)}
                strokeOpacity={0.5}
              />
              {/* Dial spins in the door's plane while live. */}
              <motion.g
                initial={false}
                animate={{ rotate: live && motionAllowed ? [0, 200, 140] : 0 }}
                transition={
                  live && motionAllowed
                    ? { duration: 1.3, times: [0, 0.6, 1], ease: EASE }
                    : { type: "spring", stiffness: 120, damping: 16 }
                }
              >
                <circle cx={27} cy={36} r={14} fill={`url(#${id}-accv)`} />
                <circle cx={27} cy={36} r={4.5} fill={FACE_TOP} />
                <path
                  d="M27 22 V31.5 M27 40.5 V50 M13 36 H22.5 M31.5 36 H41"
                  fill="none"
                />
              </motion.g>
              <rect
                x={45}
                y={27}
                width={4}
                height={18}
                rx={2}
                fill={INK_C}
                stroke="none"
              />
            </>
          }
          rightDecor={
            <>
              <path
                d="M12 46 H34 M12 53 H34 M12 60 H34"
                fill="none"
                {...detail(sw)}
              />
              <motion.circle
                cx={30}
                cy={16}
                r={3.5}
                initial={false}
                animate={{ fill: live ? a.base : "#2b2c34" }}
                transition={{ duration: motionAllowed ? 0.3 : 0 }}
              />
            </>
          }
        />
      </Rise>
    </>
  );
}

// User-supplied illustrations keep their own viewBox; the frame fits each one
// into the 240x300 art box (~80% of its width).
export function ArtFrame({
  viewBox,
  children,
}: {
  viewBox: string;
  children: ReactNode;
}) {
  return (
    <svg
      x={20}
      y={34}
      width={200}
      height={240}
      viewBox={viewBox}
      overflow="visible"
    >
      {children}
    </svg>
  );
}

// Per-kind micro-interaction: springs to `on` while live, back to `off`
// (identity transforms by default). Static under reduced motion.
export function Live({
  on,
  off,
  origin = "50% 50%",
  children,
}: {
  on: Record<string, number>;
  off?: Record<string, number>;
  origin?: string;
  children: ReactNode;
}) {
  const { live, motionAllowed } = useArt();
  const rest =
    off ??
    Object.fromEntries(
      Object.keys(on).map((k) => [k, k === "opacity" ? 1 : 0]),
    );
  return (
    <motion.g
      initial={false}
      animate={live && motionAllowed ? on : rest}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{ transformBox: "fill-box", transformOrigin: origin }}
    >
      {children}
    </motion.g>
  );
}
