"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useTime, useTransform } from "motion/react";

const IntroduceText = ({ text, href }: { text: string; href?: string }) => {
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
        <div className="relative group w-fit">

            {/* GLOW EFFECT */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-[#ff2975]/30 to-[#8c1eff]/30 rounded-[11px] blur-lg opacity-50 group-hover:opacity-100 transition duration-500" />

            {/* BORDER CONTAINER */}
            <div className="relative p-px rounded-[11px] overflow-hidden">
                {/* The Rotating Gradient Layer */}
                <motion.div
                    className="absolute inset-[0%] w-[400%] h-[400%] left-[-150%] top-[-150%]"
                    style={{
                        background: rotatingBg,
                    }}
                />

                {/* 2. Adjusted padding: px-4 (horizontal) and py-1 (vertical) */}
                <div className="relative z-10 flex items-center justify-center bg-background px-4 py-1.5 rounded-[11px] h-full">
                    <div className="text-center">
                        <span className="text-sm md:text-base font-mono whitespace-nowrap outline-none selection:bg-[#ff2975] selection:text-white inline-flex items-center gap-1.5">
                            {text}
                            {href ? <ArrowUpRight className="size-3.5" /> : null}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center w-full">
            {/* 1. Changed w-full max-w-lg to w-fit so it hugs the text */}
            {href ? (
                <Link
                    href={href}
                    aria-label={text}
                    className="rounded-[11px]"
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