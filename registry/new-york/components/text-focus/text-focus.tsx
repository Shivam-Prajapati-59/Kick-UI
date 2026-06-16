"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";

interface TextFocusProps {
    sentence?: string;
    borderColor?: string;
    blurAmount?: number;
}

interface FocusRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

const CORNERS = [
    "-top-2.5 -left-2.5 border-r-0 border-b-0",
    "-top-2.5 -right-2.5 border-l-0 border-b-0",
    "-bottom-2.5 -left-2.5 border-r-0 border-t-0",
    "-bottom-2.5 -right-2.5 border-l-0 border-t-0",
];

const TextFocus = ({
    sentence = "All Eyes on Me",
    borderColor = "#22d3ee",
    blurAmount = 3,
}: TextFocusProps) => {
    const words = sentence.split(" ");

    const [currentIndex, setCurrentIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

    const [focusRect, setFocusRect] = useState<FocusRectangle>({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });

    // Measure active word and position the focus frame around it
    const updateFocusRect = useCallback((index: number) => {
        const wordEl = wordRefs.current[index];
        const containerEl = containerRef.current;

        if (!wordEl || !containerEl) return;

        const wordRect = wordEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();

        setFocusRect({
            x: wordRect.left - containerRect.left - 2,
            y: wordRect.top - containerRect.top - 2,
            width: wordRect.width + 4,
            height: wordRect.height + 4,
        });
    }, []);

    const activeIndex = Math.min(currentIndex, words.length - 1);

    useLayoutEffect(() => {
        updateFocusRect(activeIndex);
    }, [activeIndex, sentence, updateFocusRect]);

    // Keep measurements correct when layout changes
    useEffect(() => {
        const handleResize = () => updateFocusRect(activeIndex);
        const observer = typeof ResizeObserver !== "undefined" && containerRef.current
            ? new ResizeObserver(() => handleResize())
            : null;

        window.addEventListener("resize", handleResize);
        if (observer && containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener("resize", handleResize);
            observer?.disconnect();
        };
    }, [activeIndex, updateFocusRect]);

    const cornerStyle: React.CSSProperties = {
        borderColor: "var(--border-color)",
        filter: "drop-shadow(0 0 4px var(--border-color))",
    };

    return (
        <div
            ref={containerRef}
            className="relative inline-flex flex-wrap gap-4 text-4xl lg:text-5xl font-bold"
        >
            <motion.div
                className="absolute top-0 left-0 pointer-events-none"
                animate={{
                    x: focusRect.x,
                    y: focusRect.y,
                    width: focusRect.width,
                    height: focusRect.height,
                    opacity: 1,
                }}
                transition={{ duration: 0.5 }}

                style={
                    {
                        "--border-color": borderColor,
                    } as React.CSSProperties
                }
            >
                {CORNERS.map((corner, index) => (
                    <span
                        key={index}
                        className={`absolute h-4 w-4 border-[3px] rounded-[3px] ${corner}`}
                        style={cornerStyle}
                    />
                ))}
            </motion.div>

            {words.map((word, index) => (
                <span
                    key={index}
                    ref={(el) => {
                        wordRefs.current[index] = el;
                    }}
                    onMouseEnter={() => setCurrentIndex(index)}
                    className="transition-all duration-300"
                    style={{
                        filter:
                            index === activeIndex
                                ? "blur(0px)"
                                : `blur(${blurAmount}px)`,
                    }}
                >
                    {word}
                </span>
            ))}
        </div>
    );
};

export default TextFocus;
