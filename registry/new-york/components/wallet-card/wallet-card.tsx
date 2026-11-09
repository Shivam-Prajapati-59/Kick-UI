"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const SPRING = { stiffness: 170, damping: 26 };

// Fixed noise texture in the primary colour, lit along the border by a light that follows u_mouse.
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res,u_mouse;uniform float u_hover;uniform vec3 u_color;
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float vnoise(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  for(int i=0;i<4;i++){v+=a*vnoise(p);p=p*2.03+vec2(17.1,9.2);a*=.5;}
  return v;
}
void main(){
  vec2 frag=gl_FragCoord.xy;
  vec2 p=(frag-.5*u_res)/u_res.y;
  float n=smoothstep(.25,.75,fbm(p*3.2));
  vec3 col=mix(u_color*.72,mix(u_color,vec3(1.),.14),n);
  col+=(hash(frag)-.5)*.07;

  float side=min(u_res.x,u_res.y);
  vec2 q=abs(frag-.5*u_res)-(.5*u_res-.03*side);
  float inside=-(length(max(q,0.))+min(max(q.x,q.y),0.)-.03*side);
  float edge=exp(-max(inside,0.)/(.045*side));

  // Tight spot near the border, widening to a soft ring at the centre, so the light never jumps.
  vec2 m=u_mouse*u_res;
  vec2 off=abs(m-.5*u_res)/(.5*u_res);
  float r=mix(.75,.32,clamp(max(off.x,off.y),0.,1.))*side;
  vec2 d=frag-m;
  float glow=exp(-dot(d,d)/(r*r));

  // Noise is anchored to the surface, so the light sweeps over it and nothing shimmers at rest.
  float breakup=.55+.9*fbm(p*9.);
  float grain=1.+(hash(frag.yx)-.5)*.6;
  float light=clamp(glow*edge*u_hover*breakup*grain,0.,1.);
  // The frame dims on hover because the bright noise would otherwise hide the light.
  col*=1.-.28*u_hover;
  col=mix(col,mix(u_color,vec3(1.),.85),light*.9);
  gl_FragColor=vec4(col,1.);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}

// Resolves the frame's computed background to sRGB through a 1x1 canvas, keeping shader and CSS in sync.
function frameRgb(frame: Element): [number, number, number] {
  const ctx = document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  if (!ctx) return [0, 0, 0];
  ctx.canvas.width = ctx.canvas.height = 1;
  ctx.fillStyle = getComputedStyle(frame).backgroundColor;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

// Fixed locale so the server and client render the same text.
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const SIGNED_USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  signDisplay: "always",
});
const USD_WHOLE = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const USD_COMPACT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});
const PERCENT = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "always",
});

// Mixed with the foreground so gains and losses stay readable on the card in both themes.
const GAIN =
  "text-[color:color-mix(in_oklab,var(--success)_72%,var(--foreground))]";
const LOSS =
  "text-[color:color-mix(in_oklab,var(--destructive)_72%,var(--foreground))]";

const VIEW_H = 40;

function changeOf(series: number[]) {
  const open = series[0] ?? 0;
  const delta = (series.at(-1) ?? 0) - open;
  return { delta, percent: open ? delta / open : 0 };
}

// Chart coordinates in a 100 x VIEW_H box, with headroom so the line never touches the edges.
function chartPoints(series: number[]) {
  let min = Infinity;
  let max = -Infinity;
  for (const value of series) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const span = max - min || 1;
  const last = series.length - 1 || 1;
  return series.map((value, i) => ({
    x: (i / last) * 100,
    y: 36 - ((value - min) / span) * 32,
  }));
}

// Height of the line at progress 0..1, so the dot can ride it.
function yAt(points: { y: number }[], progress: number) {
  const last = points.length - 1;
  if (last < 1) return points[0]?.y ?? VIEW_H / 2;
  const f = Math.min(Math.max(progress, 0), 1) * last;
  const i = Math.min(Math.floor(f), last - 1);
  return points[i].y + (points[i + 1].y - points[i].y) * (f - i);
}

// Range labels sit side by side in a narrow card, so millions and up are abbreviated.
function rangeLabel(amount: number) {
  return Math.abs(amount) >= 1e6
    ? USD_COMPACT.format(amount)
    : USD_WHOLE.format(amount);
}

// Shows the start and end of an address; the full value is what gets copied.
function shorten(address: string) {
  return address.length > 12
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : address;
}

export interface WalletCardProps {
  /** Wallet name shown in the header. */
  label?: string;
  /** Network name, used for the accessible label and the logo fallback. */
  chain?: string;
  /** Network logo URL. Without it the chain's first letter is shown instead. */
  logo?: string;
  /** Full wallet address. The header shows it shortened; the copy button copies all of it. */
  address: string;
  /** Lifetime rewards in USD. The rewards rows only show when this is set. */
  rewards?: number;
  /** USD balance over the past 24h, oldest first. The last entry is the current balance. */
  history: number[];
  className?: string;
}

// Renders a single-chain wallet balance inside a noise frame whose border light follows the cursor.
// The chart is revealed on load by a dot riding its line; every figure derives from `history`.
// Only the canvas redraws on hover: the card and its content never transform.
function WalletCard({
  label = "Main wallet",
  chain,
  logo,
  address,
  rewards,
  history,
  className,
}: WalletCardProps) {
  const gradientId = useId();
  const series = useMemo(() => history.filter(Number.isFinite), [history]);
  const points = useMemo(() => chartPoints(series), [series]);
  const hasChart = series.length >= 2;
  const line = points
    .map(({ x, y }, i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  const value = series.at(-1) ?? 0;
  const low = Math.min(value, ...series);
  const high = Math.max(value, ...series);
  const marker = high > low ? ((value - low) / (high - low)) * 100 : 50;
  const { delta, percent } = changeOf(series);
  const formatted = USD.format(value);
  const [whole, cents] = formatted.split(".");
  // Longer balances shrink to stay on one line instead of wrapping mid-number.
  const balanceScale = Math.min(1, 11 / formatted.length);
  const showRewards = rewards !== undefined && Number.isFinite(rewards);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const hovering = useRef(false);
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  // Copies the full address; the check icon only shows if the clipboard accepted it.
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  const hover = useSpring(0, SPRING);
  const mouseX = useSpring(0.5, SPRING);
  const mouseY = useSpring(0.5, SPRING);

  // One 0..1 value drives the clip and the dot, so the visible line always ends at the dot.
  // It plays once on mount; later data changes redraw in place instead of replaying.
  const progress = useMotionValue(0);
  const reveal = useTransform(
    progress,
    (p) => `inset(0 ${(1 - p) * 100}% 0 0)`,
  );
  const settled = useTransform(progress, [0.92, 1], [0, 1]);

  useEffect(() => {
    if (reduce) {
      progress.set(1);
      return;
    }
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [reduce, progress]);

  // Positions the dot imperatively so it always uses the latest points.
  useEffect(() => {
    const place = (p: number) => {
      const dot = dotRef.current;
      if (!dot) return;
      dot.style.left = `clamp(6px, ${p * 100}%, calc(100% - 6px))`;
      dot.style.top = `${(yAt(points, p) / VIEW_H) * 100}%`;
    };
    place(progress.get());
    return progress.on("change", place);
  }, [progress, points]);

  // Pointer position as 0..1 of the card, with y up to match gl_FragCoord.
  const pointer = (e: PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return [0.5, 0.5];
    return [
      (e.clientX - rect.left) / rect.width,
      1 - (e.clientY - rect.top) / rect.height,
    ];
  };

  // Draws only when a spring changes, on resize or on theme change, so idle cost is zero.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: false,
      antialias: false,
    });
    if (!gl) return;

    type Uniforms = Record<
      "res" | "mouse" | "hover" | "color",
      WebGLUniformLocation | null
    >;

    // Builds the program and buffers. Also runs again when the browser restores a lost context.
    const setup = (): Uniforms | null => {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      const prog = gl.createProgram();
      if (!vs || !fs || !prog) return null;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
      gl.useProgram(prog);

      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const loc = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      return {
        res: gl.getUniformLocation(prog, "u_res"),
        mouse: gl.getUniformLocation(prog, "u_mouse"),
        hover: gl.getUniformLocation(prog, "u_hover"),
        color: gl.getUniformLocation(prog, "u_color"),
      };
    };

    let uniforms = setup();
    // Without WebGL the plain frame colour stays as the fallback.
    if (!uniforms) return;

    let rgb = frameRgb(canvas.parentElement ?? canvas);
    let raf = 0;

    const draw = () => {
      if (!uniforms) return;
      gl.uniform2f(uniforms.res, canvas.width, canvas.height);
      gl.uniform2f(uniforms.mouse, mouseX.get(), mouseY.get());
      gl.uniform1f(uniforms.hover, Math.min(Math.max(hover.get(), 0), 1));
      gl.uniform3f(uniforms.color, ...rgb);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const schedule = () => {
      if (raf || !uniforms) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        draw();
      });
    };

    const setColor = () => {
      rgb = frameRgb(canvas.parentElement ?? canvas);
      draw();
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw();
    };

    const onLost = (e: Event) => {
      e.preventDefault();
      uniforms = null;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onRestored = () => {
      uniforms = setup();
      resize();
    };

    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const themeObserver = new MutationObserver(setColor);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const unsubscribers = [hover, mouseX, mouseY].map((value) =>
      value.on("change", schedule),
    );

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [hover, mouseX, mouseY]);

  return (
    <article
      aria-label={chain ? `${chain} ${label}` : label}
      onPointerEnter={(e) => {
        if (reduce || e.pointerType === "touch") return;
        // Appear at the entry point instead of flying in from the last position.
        if (hover.get() < 0.01) {
          const [x, y] = pointer(e);
          mouseX.jump(x);
          mouseY.jump(y);
        }
        hovering.current = true;
        hover.set(1);
      }}
      onPointerMove={(e) => {
        if (!hovering.current) return;
        const [x, y] = pointer(e);
        mouseX.set(x);
        mouseY.set(y);
      }}
      onPointerLeave={() => {
        hovering.current = false;
        hover.set(0);
      }}
      className={cn(
        // Dark mode pulls the frame toward the page so it does not glare against a near-black background.
        "group relative w-full border-(--frame) bg-(--frame) [--frame:var(--primary)] dark:[--frame:color-mix(in_oklab,var(--primary)_55%,var(--background))]",
        "max-w-[382px] overflow-hidden rounded-xl border shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_12%,transparent),0_1px_2px_color-mix(in_oklab,var(--foreground)_12%,transparent),0_12px_32px_-18px_color-mix(in_oklab,var(--foreground)_32%,transparent)]",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full"
      />
      <div
        aria-hidden="true"
        className="ring-primary-foreground/50 dark:ring-foreground/50 pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-1 transition-opacity duration-200 ring-inset group-hover:opacity-100 motion-safe:hidden"
      />

      <div className="bg-card text-card-foreground relative m-3 overflow-hidden rounded-lg p-5 max-[400px]:m-2 max-[400px]:p-4">
        <header className="flex items-center justify-between gap-3 max-[400px]:gap-2">
          <div className="flex min-w-0 items-center gap-3 max-[400px]:gap-2.5">
            <span
              aria-hidden="true"
              className="bg-muted ring-border flex size-11 shrink-0 items-center justify-center rounded-full ring-1 max-[400px]:size-9"
            >
              {logo ? (
                <Image
                  src={logo}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full max-[400px]:size-8"
                />
              ) : (
                <span className="text-lg font-semibold">
                  {(chain ?? label).charAt(0).toUpperCase()}
                </span>
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[19px] font-semibold max-[400px]:text-[17px]">
                {label}
              </p>
              <p className="text-muted-foreground -mt-1 flex items-center gap-1.5 font-mono text-[14.5px] max-[400px]:text-[13px]">
                <span className="truncate">{shorten(address)}</span>
                <motion.button
                  type="button"
                  onClick={copyAddress}
                  aria-label="Copy address"
                  whileTap={reduce ? undefined : { scale: 0.88 }}
                  className="hover:text-foreground focus-visible:ring-ring -m-1.5 shrink-0 rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={copied ? "done" : "copy"}
                      className="block"
                      initial={{
                        opacity: 0,
                        scale: reduce ? 1 : 0.6,
                        filter: reduce ? "blur(0px)" : "blur(3px)",
                      }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{
                        opacity: 0,
                        scale: reduce ? 1 : 0.6,
                        filter: reduce ? "blur(0px)" : "blur(3px)",
                      }}
                      transition={{
                        duration: reduce ? 0 : 0.16,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {copied ? (
                        <Check size={14} className={GAIN} aria-hidden="true" />
                      ) : (
                        <Copy size={14} aria-hidden="true" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
                <span aria-live="polite" className="sr-only">
                  {copied ? "Address copied" : ""}
                </span>
              </p>
            </div>
          </div>
          <span className="border-border bg-muted text-muted-foreground shrink-0 rounded-xl border px-2.5 py-2 text-[15px] leading-none font-semibold tracking-wider max-[400px]:px-2 max-[400px]:py-1.5 max-[400px]:text-xs">
            24H
          </span>
        </header>

        <div className="mt-5">
          <p className="text-muted-foreground text-[13px]">Wallet balance</p>
          <p
            style={{
              fontSize: `calc(clamp(1.75rem, 9.5vw, 2.5rem) * ${balanceScale})`,
            }}
            className="mt-1.5 leading-none font-semibold tracking-[-0.035em] [overflow-wrap:anywhere] tabular-nums"
          >
            {whole}
            <span className="text-muted-foreground/60">.{cents}</span>
          </p>
          {hasChart && (
            <p
              className={cn(
                "mt-2 text-[13px] font-medium tabular-nums",
                delta < 0 ? LOSS : GAIN,
              )}
            >
              {SIGNED_USD.format(delta)} · {PERCENT.format(percent)}
            </p>
          )}
        </div>

        {hasChart && (
          <>
            <div
              aria-hidden="true"
              className="relative -mx-5 mt-1 h-20 max-[400px]:-mx-4"
            >
              <motion.svg
                viewBox={`0 0 100 ${VIEW_H}`}
                preserveAspectRatio="none"
                className="absolute inset-0 size-full"
                style={{ clipPath: reveal }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0"
                      stopOpacity="0.28"
                      style={{ stopColor: "var(--primary)" }}
                    />
                    <stop
                      offset="1"
                      stopOpacity="0"
                      style={{ stopColor: "var(--primary)" }}
                    />
                  </linearGradient>
                </defs>
                <path
                  d={`${line} L100 ${VIEW_H} L0 ${VIEW_H} Z`}
                  fill={`url(#${gradientId})`}
                />
                <path
                  d={line}
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className="stroke-primary"
                />
              </motion.svg>
              <span
                ref={dotRef}
                className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: 6,
                  top: `${((points[0]?.y ?? VIEW_H / 2) / VIEW_H) * 100}%`,
                }}
              >
                <motion.span
                  className="bg-primary absolute inset-0 rounded-full motion-safe:animate-ping"
                  style={{ opacity: settled }}
                />
                <span className="bg-primary ring-card relative block size-full rounded-full ring-2" />
              </span>
            </div>

            <div className="mt-3 text-xs tabular-nums">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">24h range</span>
                <span className="font-medium">
                  {PERCENT.format(low ? (high - low) / low : 0).replace(
                    "+",
                    "",
                  )}
                </span>
              </div>
              <div
                aria-hidden="true"
                className="border-muted-foreground/50 relative mt-3 border-t border-dotted"
              >
                <span
                  style={{ left: `${marker}%` }}
                  className="bg-primary ring-card absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2"
                />
              </div>
              <div className="text-muted-foreground mt-2.5 flex justify-between gap-3">
                <span>{rangeLabel(low)}</span>
                <span>{rangeLabel(high)}</span>
              </div>
            </div>
          </>
        )}

        {showRewards && (
          <dl className="border-muted-foreground/50 mt-3 space-y-1.5 border-t border-dotted pt-3 text-sm tabular-nums">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Total rewards</dt>
              <dd className="shrink-0 font-semibold whitespace-nowrap">
                {USD.format(rewards)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Total deposited</dt>
              <dd className="shrink-0 font-semibold whitespace-nowrap">
                {USD.format(Math.max(0, value - rewards))}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </article>
  );
}

export default WalletCard;
export { WalletCard };
