"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import figlet, { type Fonts } from "figlet";

type AsciiTextProps = {
    text: string;
    font?: Fonts;
    className?: string;
};

export default function AsciiText({
    text,
    font = "ANSI Shadow",
    className = "",
}: AsciiTextProps) {
    const [rendered, setRendered] = useState({ key: "", value: "" });
    const requestIdRef = useRef(0);
    const currentKey = `${font}::${text}`;

    useEffect(() => {
        requestIdRef.current += 1;
        const requestId = requestIdRef.current;

        figlet.text(
            text,
            {
                font,
                horizontalLayout: "default",
                verticalLayout: "default",
            },
            (err: Error | null, data?: string) => {
                if (requestId !== requestIdRef.current) return;
                if (err || !data) {
                    setRendered({ key: currentKey, value: text });
                    return;
                }

                setRendered({ key: currentKey, value: data });
            }
        );
    }, [currentKey, text, font]);

    const displayValue = rendered.key === currentKey ? rendered.value : text;

    return (
        <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            aria-busy={rendered.key !== currentKey}
            className={`font-mono leading-none whitespace-pre overflow-x-auto ${className}`}
        >
            {displayValue}
        </motion.pre>
    );
}
