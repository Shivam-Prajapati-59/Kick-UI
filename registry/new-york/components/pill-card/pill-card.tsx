"use client";
import { useRef, useEffect, useState } from "react";
import { ShieldCheck, Database, Radio, Monitor, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const CYCLE = 2.4;
const ARRIVE = 0.65;
const DOT_LEN = 0.15;
const STAGGER = 0.15;

const ICON_LIST = [
  { IconComponent: Monitor },
  { IconComponent: Wallet },
  { IconComponent: ShieldCheck },
  { IconComponent: Database },
];

const ICON_SIZE = 38;
const ICON_GAP = 36;
const PATH_START_Y = 38;

const PillCard = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 350, h: 450 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { w: W, h: H } = dimensions;
  const ICON_Y = H - 155;
  const PATH_END_Y = ICON_Y + 3;

  const totalWidth = ICON_LIST.length * ICON_SIZE + (ICON_LIST.length - 1) * ICON_GAP;
  const startX = (W - totalWidth) / 2;

  const ICONS = ICON_LIST.map((icon, i) => ({
    ...icon,
    x: startX + i * (ICON_SIZE + ICON_GAP) + ICON_SIZE / 2,
  }));

  const generatePath = (targetX: number) => {
    const mid = PATH_START_Y + (PATH_END_Y - PATH_START_Y) * 0.35;
    const cx = W / 2;
    return `M ${cx} ${PATH_START_Y} C ${cx} ${mid * 0.6 + PATH_START_Y * 0.4}, ${targetX} ${mid}, ${targetX} ${PATH_END_Y}`;
  };

  return (
    <div className="relative w-full max-w-87.5 h-112.5 overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div ref={containerRef} className="absolute inset-0">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${W} ${H}`}
          fill="none"
        >
          {ICONS.map((icon, i) => (
            <motion.path
              key={i}
              d={generatePath(icon.x)}
              className="stroke-primary"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: DOT_LEN, pathOffset: 0, opacity: 1 }}
              animate={{
                pathOffset: [0, 1 - DOT_LEN, 1, 1],
                opacity: [1, 1, 0, 0],
              }}
              transition={{
                duration: CYCLE,
                ease: "linear",
                repeat: Infinity,
                delay: i * STAGGER,
                times: [0, ARRIVE, ARRIVE + 0.1, 1],
              }}
            />
          ))}
        </svg>

        {ICONS.map((icon, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: icon.x,
              top: ICON_Y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <Icon cycle={CYCLE} arrive={ARRIVE} delay={i * STAGGER}>
              <icon.IconComponent className="h-1/2 w-1/2" strokeWidth={1.5} />
            </Icon>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center h-full p-6">
        <button className="rounded-lg border border-border bg-secondary px-5 py-2 flex items-center gap-2 shadow-xs">
          <Radio size={16} className="text-primary" />
          <span className="text-sm font-medium text-foreground">rpc : mainnet-1</span>
        </button>

        <div className="mt-auto space-y-1.5 pb-2">
          <h3 className="text-xl font-medium text-foreground">MCP Server</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A hosted server with 160+ blockchain tools for any MCP client.
          </p>
        </div>
      </div>
    </div>
  );
};

const Icon = ({
  children,
  cycle,
  arrive,
  delay,
}: {
  children: React.ReactNode;
  cycle: number;
  arrive: number;
  delay: number;
}) => (
  <motion.div
    animate={{
      boxShadow: [
        "0px 0px 0px oklch(0.5905 0.2097 303.5671 / 0)",
        "0px 0px 0px oklch(0.5905 0.2097 303.5671 / 0)",
        "0px 0px 18px oklch(0.5905 0.2097 303.5671 / 0.5)",
        "0px 0px 0px oklch(0.5905 0.2097 303.5671 / 0)",
      ],
      color: [
        "#9ca3af",
        "#9ca3af",
        "oklch(0.5905 0.2097 303.5671)",
        "#9ca3af",
      ],
    }}
    transition={{
      duration: cycle,
      ease: "linear",
      repeat: Infinity,
      delay,
      times: [0, arrive - 0.01, arrive + 0.05, 1],
    }}
    whileHover={{
      boxShadow: "0px 0px 20px oklch(0.5905 0.2097 303.5671 / 0.55)",
      color: "oklch(0.5905 0.2097 303.5671)",
    }}
    className={cn(
      "relative flex items-center justify-center rounded-xl cursor-pointer backdrop-blur-xs",
      "bg-secondary text-foreground border border-border shadow-xs",
      "w-14 h-14",
    )}
  >
    {children}
  </motion.div>
);

export default PillCard;
