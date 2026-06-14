"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useReducedMotion } from "motion/react";

// The mix of technical glyphs used for decoding
const GLYPHS = "!<>-_\\\\/[]{}—=+*^?#";

interface ScrambleTextProps {
    text: string;
    href?: string;
}

const ScrambleText = ({ text, href = "#" }: ScrambleTextProps) => {
    const baseChars = useMemo(
        () => text.split("").map((char) => ({ char, isScrambled: false })),
        [text]
    );
    const [charArray, setCharArray] = useState(baseChars);
    const [isHovered, setIsHovered] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isHovered || prefersReducedMotion) {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            return;
        }

        let startTimestamp = 0;
        let lastMutationTime = 0;

        const animate = (currentTime: number) => {
            if (!startTimestamp) startTimestamp = currentTime;
            const elapsedTime = currentTime - startTimestamp;

            // Smoothly calculate the continuous sweep position based on elapsed time.
            // 80ms per character means it glides smoothly.
            // The -2 offset gives a brief initial burst where the whole word is scrambled.
            const iteration = (elapsedTime / 80) - 2;

            // Reduce char flipping speed to 60ms (approx ~16fps) for a readable, smooth glitch effect
            if (currentTime - lastMutationTime >= 60) {
                setCharArray(() => {
                    return text.split("").map((letter, index) => {
                        if (letter === " ") return { char: " ", isScrambled: false };

                        // Lock the character in if the sweep has reached it
                        if (index < Math.floor(iteration)) {
                            return { char: text[index], isScrambled: false };
                        }

                        // Otherwise show a random character
                        return {
                            char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
                            isScrambled: true
                        };
                    });
                });

                lastMutationTime = currentTime;
            }

            // Continue until the sweep has fully passed the end of the text
            if (iteration < text.length) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setCharArray(text.split("").map(char => ({ char, isScrambled: false })));
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isHovered, text, prefersReducedMotion]);

    const displayChars = !isHovered || prefersReducedMotion ? baseChars : charArray;

    return (
        <a
            href={href}
            onMouseEnter={() => {
                setIsHovered(true);
                setCharArray(baseChars);
            }}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative inline-flex items-center text-foreground no-underline font-mono uppercase tracking-[2.6px] leading-normal cursor-pointer font-bold"
        >
            <span className="sr-only">{text}</span>

            {/* Invisible structural text to permanently freeze the layout element's exact final width.
                This prevents the parent flex container from constantly re-centering
                when random characters are wider or narrower! */}
            <span className="invisible whitespace-nowrap" aria-hidden="true">
                {text}
            </span>

            {/* The animated characters overlay, anchored rigidly to the left.
                Any width expansion/contraction from random glyphs will exclusively bleed to the right. */}
            <span className="absolute left-0 top-0 flex items-center h-full pointer-events-none">
                <div aria-hidden="true" style={{ position: "relative", display: "inline-flex" }}>
                    {displayChars.map((item, index) => (
                        <div
                            key={index}
                            className="inline-block relative"
                            style={{
                                opacity: item.isScrambled ? 0.8333 : 1,
                                color: item.isScrambled ? "var(--muted-foreground)" : "inherit",
                                transformOrigin: "50% 0%",
                                width: item.char === " " ? "0.5em" : "auto"
                            }}
                        >
                            {item.char}
                        </div>
                    ))}
                </div>
            </span>
        </a>
    );
};

export default ScrambleText;
