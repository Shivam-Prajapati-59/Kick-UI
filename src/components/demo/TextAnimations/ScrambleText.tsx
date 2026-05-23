"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

// The precise mix of technical glyphs used for high-end decoding
const GLYPHS = "!<>-_\\/[]{}—=+*^?#_";

interface IncrediblesTextProps {
    text: string;
    href?: string;
}

const IncrediblesText = ({ text, href = "#" }: IncrediblesTextProps) => {
    const [charArray, setCharArray] = useState<string[]>(text.split(""));
    const [isHovered, setIsHovered] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isHovered || prefersReducedMotion) {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            setCharArray(text.split(""));
            return;
        }

        let iteration = -6; // Start negative to have an initial delay where everything scrambles
        let lastMutationTime = 0;

        const animate = (currentTime: number) => {
            // Increase the throttle time to slow down the random character swap rate
            if (currentTime - lastMutationTime >= 120) {
                setCharArray(() => {
                    return text.split("").map((letter, index) => {
                        if (letter === " ") return " ";

                        // Lock the character in if the sweep has reached it
                        if (index < iteration) {
                            return text[index];
                        }

                        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                    });
                });

                // Increase iteration by a larger amount to speed up the left-to-right cascade 
                // e.g. 2 means it sweeps 2 characters per update loop
                iteration += 2;
                lastMutationTime = currentTime;
            }

            // Continue until iteration reaches the end of the text
            if (iteration < text.length) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setCharArray(text.split(""));
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isHovered, text, prefersReducedMotion]);

    return (
        <motion.a
            href={href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="font-mono text-sm tracking-[0.2rem] uppercase whitespace-nowrap leading-[0.9] cursor-pointer inline-flex overflow-hidden text-primary select-none"
        >
            {/* Screen reader protection */}
            <span className="sr-only">{text}</span>

            {/* Visual letters */}
            <span aria-hidden="true" className="flex">
                {charArray.map((char, index) => {
                    const isFinal = char === text[index];

                    return (
                        <motion.span
                            key={`${index}-${char}`}
                            initial={{
                                y: isFinal ? 0 : (Math.random() * 2 - 1), // extremely subtle vertical shake
                                x: isFinal ? 0 : (Math.random() * 2 - 1), // extremely subtle horizontal shake
                                scale: isFinal ? 1 : 0.95,
                            }}
                            animate={{
                                y: 0,
                                x: 0,
                                scale: 1,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 10,
                            }}
                            className="relative inline-block uppercase origin-top"
                            style={{
                                color: isFinal ? "#ffffff" : "#4b5563",
                                // A slight glowing glitch effect while scrambled, flat text for final
                                textShadow: isFinal ? "none" : "0 0 4px rgba(255, 255, 255, 0.3)",
                            }}
                        >
                            {char}
                        </motion.span>
                    );
                })}
            </span>
        </motion.a>
    );
};

export default IncrediblesText;