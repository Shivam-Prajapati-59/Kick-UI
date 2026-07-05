"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import figlet, { type FontName } from "figlet";

type AsciiTextProps = {
    text: string;
    font?: FontName;
    className?: string;
};

export default function AsciiText({
    text,
    font = "Standard",
    className = "",
}: AsciiTextProps) {
    const availableFonts = useMemo(() => figlet.fontsSync().sort((a, b) => a.localeCompare(b)), []);
    const [selectedFont, setSelectedFont] = useState<FontName>(font);
    const requestIdRef = useRef(0);
    const currentKey = `${selectedFont}::${text}`;
    const [rendered, setRendered] = useState(() => ({
        key: currentKey,
        value: text,
        ready: false,
    }));

    useEffect(() => {
        setSelectedFont(font);
    }, [font]);

    useEffect(() => {
        requestIdRef.current += 1;
        const requestId = requestIdRef.current;

        (async () => {
            try {
                const fontModule = await import(`figlet/importable-fonts/${selectedFont}.js`);
                figlet.parseFont(selectedFont, fontModule.default);

                const ascii = figlet.textSync(text, {
                    font: selectedFont,
                    horizontalLayout: "default",
                    verticalLayout: "default",
                    whitespaceBreak: true,
                });

                if (requestId !== requestIdRef.current) return;
                setRendered({
                    key: currentKey,
                    value: ascii,
                    ready: true,
                });
            } catch {
                if (requestId !== requestIdRef.current) return;
                setRendered({
                    key: currentKey,
                    value: text,
                    ready: true,
                });
            }
        })();
    }, [currentKey, selectedFont, text]);

    const displayValue = rendered.key === currentKey ? rendered.value : text;
    const isReady = rendered.key === currentKey && rendered.ready;
    const lines = displayValue.split("\n");

    return (
        <div className={`w-full space-y-4 ${className}`}>
            <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
                <span>Font</span>
                <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value as FontName)}
                    className="max-w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring/50"
                >
                    {availableFonts.map((availableFont) => (
                        <option key={availableFont} value={availableFont}>
                            {availableFont}
                        </option>
                    ))}
                </select>
            </label>

            <motion.pre
                key={`${selectedFont}::${text}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                aria-label={text}
                aria-busy={!isReady}
                className="font-mono leading-none whitespace-pre overflow-x-auto"
            >
                {isReady ? (
                    lines.map((line, index) => (
                        <motion.span
                            key={`${selectedFont}-${text}-${index}`}
                            initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.3, delay: index * 0.03, ease: "easeOut" }}
                            className="block whitespace-pre text-white"
                        >
                            {line || "\u00A0"}
                        </motion.span>
                    ))
                ) : (
                    <span className="block whitespace-pre text-white">{text}</span>
                )}
            </motion.pre>
        </div>
    );
}
