"use client";

import Image from "next/image";
import { motion, MotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState, type RefObject } from "react";

export interface ScrollCardFeature {
  title: string;
  description: string;
  image: string;
}

export interface ScrollCardProps {
  features?: ScrollCardFeature[];
  className?: string;
  /** Height of the scroll container (default: "500vh") */
  scrollHeight?: string;
  /** Optional scrollable parent for embedded previews. */
  scrollContainer?: RefObject<HTMLElement | null>;
}

const defaultFeatures: ScrollCardFeature[] = [
  {
    title: "Secure Wallet Infrastructure",
    description: "Embedded wallets with MPC-based key management and recovery.",
    image: "/assets/dummy/Card1.png",
  },
  {
    title: "Passwordless Authentication",
    description: "Sign in with email or social accounts in just one click.",
    image: "/assets/dummy/Card2.png",
  },
  {
    title: "Developer-Friendly APIs",
    description: "Simple SDKs for wallet creation, signing, and user onboarding.",
    image: "/assets/dummy/Card3.png",
  },
  {
    title: "Enterprise-Grade Security",
    description: "Policy-based access controls with secure distributed custody.",
    image: "/assets/dummy/Card4.png",
  },
];

export default function ScrollCard({
  features = defaultFeatures,
  className,
  scrollHeight = "500vh",
  scrollContainer,
}: ScrollCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    container: scrollContainer,
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 320,
    damping: 42,
    mass: 0.7,
    restDelta: 0.0005,
  });

  return (
    <section
      ref={containerRef}
      className={`relative mx-auto max-w-6xl px-4 md:px-6 ${className ?? ""}`}
      style={{ height: scrollHeight }}
    >
      <div className="sticky top-0 flex h-[var(--scroll-card-viewport-height,100vh)] items-center">
        <div className="grid w-full grid-cols-1 items-center gap-6 md:gap-10 md:grid-cols-2">
          <div className="relative w-full overflow-hidden rounded-xl h-[300px] md:h-[490px]">
            {features.map((feature, index) => (
              <ScrollImage
                key={feature.title}
                feature={feature}
                index={index}
                total={features.length}
                progress={smoothProgress}
              />
            ))}
          </div>

          <div className="relative h-[300px] md:h-[490px]">
            {features.map((feature, index) => (
              <TextItem
                key={feature.title}
                feature={feature}
                index={index}
                total={features.length}
                progress={smoothProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ScrollItemProps {
  feature: ScrollCardFeature;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

function useActiveValue(progress: MotionValue<number>, index: number, total: number) {
  const sectionLength = 1 / total;
  const start = index * sectionLength;
  const end = (index + 1) * sectionLength;
  const slideStart = Math.max(0, start - sectionLength);
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const inputs = isFirst
    ? [0, start, end]
    : isLast
      ? [slideStart, start, 1]
      : [slideStart, start, end];
  const outputs = isFirst
    ? [1, 1, 0]
    : isLast
      ? [0, 1, 1]
      : [0, 1, 0];

  const active = useTransform(progress, inputs, outputs);
  return { active, start, end, slideStart, isFirst, isLast };
}

function ScrollImage({ feature, index, total, progress }: ScrollItemProps) {
  const { start, end, slideStart, isFirst, isLast } = useActiveValue(progress, index, total);

  const y = useTransform(
    progress,
    isFirst ? [0, 1] : [slideStart, start],
    isFirst ? ["0%", "0%"] : ["100%", "0%"],
  );
  const scale = useTransform(progress, isLast ? [0, 1] : [start, end], isLast ? [1, 1] : [1, 0.7]);
  const hidePoint = Math.min(end + 0.001, 1);
  const opacity = useTransform(
    progress,
    isLast ? [0, 1] : [start, end, hidePoint, 1],
    isLast ? [1, 1] : [1, 0.2, 0, 0],
  );

  return (
    <motion.div
      style={{ y, scale, opacity, zIndex: index, willChange: "transform, opacity" }}
      className="absolute inset-0 origin-top"
    >
      <Image
        src={feature.image}
        alt={feature.title}
        fill
        className="object-cover rounded-xl"
        draggable={false}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </motion.div>
  );
}

function TextItem({ feature, index, total, progress }: ScrollItemProps) {
  const { active } = useActiveValue(progress, index, total);
  const [isActive, setIsActive] = useState(() => active.get() > 0.5);

  useMotionValueEvent(active, "change", (v) => {
    setIsActive(v > 0.5);
  });

  const letterSpacing = useTransform(active, [0, 1], ["-0.01em", "-0.02em"]);
  const descHeight = useTransform(active, [0, 1], [0, 56]);
  const descOpacity = useTransform(active, [0, 0.6, 1], [0, 0, 1]);
  const descY = useTransform(active, [0, 1], [-6, 0]);

  return (
    <div className="flex flex-col space-y-2 md:space-y-5">
      <motion.h2
        style={{ letterSpacing }}
        className={`max-w-sm text-3xl md:text-4xl font-medium leading-[1.15] tracking-tight transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-foreground"
          }`}
      >
        {feature.title}
      </motion.h2>
      <motion.div style={{ height: descHeight }} className="overflow-hidden">
        <motion.p
          style={{ opacity: descOpacity, y: descY }}
          className="max-w-md text-sm md:text-[16px] leading-relaxed text-muted-foreground"
        >
          {feature.description}
        </motion.p>
      </motion.div>
    </div>
  );
}

export { ScrollCard };
