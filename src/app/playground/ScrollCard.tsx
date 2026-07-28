"use client";

import Image from "next/image";
import { motion, MotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";

const features = [
    {
        title: "Bitcoin",
        description:
            "The first decentralized cryptocurrency, enabling peer-to-peer digital value transfer without intermediaries. Powered by proof-of-work consensus.",
        image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80",
    },
    {
        title: "Ethereum",
        description:
            "A programmable blockchain that executes smart contracts and hosts decentralized applications across a global distributed network.",
        image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&q=80",
    },
    {
        title: "Solana",
        description:
            "A high-performance Layer 1 blockchain achieving global-scale throughput through its unique proof-of-history consensus mechanism.",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    },
    {
        title: "Polkadot",
        description:
            "A heterogeneous multi-chain network enabling cross-chain interoperability, allowing different blockchains to securely communicate and share data.",
        image: "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?w=800&q=80",
    },
];

export default function ScrollCard() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
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
        <section ref={containerRef} className="relative mx-auto h-[500vh] max-w-6xl px-4 md:px-6">
            <div className="sticky top-0 flex h-screen items-center">
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

                    <div className="flex flex-col justify-center gap-6 h-[300px] md:h-[490px]">
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
    feature: (typeof features)[number];
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

    const inputs = isFirst ? [0, start, end] : isLast ? [slideStart, start, 1] : [slideStart, start, end];
    const outputs = isFirst ? [1, 1, 0] : isLast ? [0, 1, 1] : [0, 1, 0];

    const active = useTransform(progress, inputs, outputs);
    return { active, start, end, slideStart, isFirst, isLast };
}

function ScrollImage({ feature, index, total, progress }: ScrollItemProps) {
    const { active, start, end, slideStart, isFirst, isLast } = useActiveValue(progress, index, total);

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

    const labelScale = useTransform(active, [0, 1], [0.94, 1]);

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
            <motion.div
                style={{ opacity: active, scale: labelScale }}
                className="pointer-events-none absolute bottom-3 left-3 md:bottom-5 md:left-5 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-[13px] font-medium tracking-tight text-foreground backdrop-blur-md border border-border/50"
            >
                {feature.title}
            </motion.div>
        </motion.div>
    );
}

function TextItem({ feature, index, total, progress }: ScrollItemProps) {
    const { active } = useActiveValue(progress, index, total);
    const [isActive, setIsActive] = useState(false);

    useMotionValueEvent(active, "change", (v) => {
        setIsActive(v > 0.5);
    });

    const letterSpacing = useTransform(active, [0, 1], ["-0.01em", "-0.02em"]);
    const descHeight = useTransform(active, [0, 1], [0, 56]);
    const descOpacity = useTransform(active, [0, 0.6, 1], [0, 0, 1]);
    const descY = useTransform(active, [0, 1], [-6, 0]);

    return (
        <div className="flex flex-col space-y-2 md:space-y-4">
            <motion.h2
                style={{ letterSpacing }}
                className={`text-3xl md:text-6xl font-bold leading-[1.15] tracking-tight transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
            >
                {feature.title}
            </motion.h2>
            <motion.div style={{ height: descHeight }} className="overflow-hidden">
                <motion.p
                    style={{ opacity: descOpacity, y: descY }}
                    className="max-w-md text-sm md:text-[18px] leading-relaxed text-muted-foreground"
                >
                    {feature.description}
                </motion.p>
            </motion.div>
        </div>
    );
}
