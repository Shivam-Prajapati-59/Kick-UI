"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useTime, useTransform } from "motion/react";

const IntroduceText = ({
  text,
  href,
  badge,
}: {
  text: string;
  href?: string;
  badge?: string;
}) => {
  const time = useTime();
  const rotate = useTransform(time, [0, 4000], [0, 360], {
    clamp: false,
  });

  // Pink to Purple gradient "snake" effect
  const rotatingBg = useTransform(rotate, (r) => {
    return `conic-gradient(from ${r}deg, transparent 0deg, transparent 280deg, #ff2975 320deg, #8c1eff 360deg)`;
  });

  // Pill content — extracted so it can be wrapped in a Link when `href` is set.
  const pill = (
    <div className="group relative w-fit">
      {/* GLOW EFFECT */}
      <div className="absolute -inset-0.5 rounded-[11px] bg-linear-to-r from-[#ff2975]/30 to-[#8c1eff]/30 opacity-50 blur-lg transition duration-500 group-hover:opacity-100" />

      {/* BORDER CONTAINER */}
      <div className="relative overflow-hidden rounded-[11px] p-px">
        {/* The Rotating Gradient Layer */}
        <motion.div
          className="absolute inset-[0%] top-[-150%] left-[-150%] h-[400%] w-[400%]"
          style={{
            background: rotatingBg,
          }}
        />

        {/* 2. Adjusted padding: px-4 (horizontal) and py-1 (vertical) */}
        <div className="bg-background relative z-10 flex h-full items-center justify-center rounded-[11px] px-4 py-1.5">
          <div className="flex items-center gap-2">
            {badge ? (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase">
                {badge}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap outline-none selection:bg-[#ff2975] selection:text-white md:text-base">
              {text}
              {href ? (
                <span className="relative inline-block size-3.5 overflow-hidden">
                  {/* Arrow 1: exits toward the top-right on pill hover */}
                  <span className="absolute inset-0 flex items-center justify-center transition-transform delay-150 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pill:translate-x-[14px] group-hover/pill:-translate-y-[14px]">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                  {/* Arrow 2: enters from the bottom-left on pill hover */}
                  <span className="absolute inset-0 flex -translate-x-[14px] translate-y-[14px] items-center justify-center transition-transform delay-150 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pill:translate-x-0 group-hover/pill:translate-y-0">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </span>
              ) : null}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex w-fit flex-col justify-center">
      {/* 1. Changed w-full max-w-lg to w-fit so it hugs the text.
                Placement (centered vs left) is owned by the parent. */}
      {href ? (
        <Link
          href={href}
          aria-label={text}
          className="group/pill rounded-[11px]"
        >
          {pill}
        </Link>
      ) : (
        pill
      )}
    </div>
  );
};

export default IntroduceText;
