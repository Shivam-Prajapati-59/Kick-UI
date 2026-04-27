"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { Check, Copy, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { coldarkLightLike } from "@/lib/code-theme";

/* ------------------------------------------------------------------ */
/*  Per-route expansion state — survives re-renders within a session   */
/* ------------------------------------------------------------------ */

const routeExpansionState: Record<string, Record<string, boolean>> = {};

function hashSnippet(str: string | undefined): string {
    if (!str) return "empty";
    let hash = 0;
    const len = Math.min(str.length, 500);
    for (let i = 0; i < len; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash.toString(36);
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface CodeHighlighterProps {
    /** The code string to display */
    codeString: string;
    /** Syntax highlighting language (e.g. "tsx", "css", "bash") */
    language?: string;
    /** Show line numbers (default: true) */
    showLineNumbers?: boolean;
    /** Max visible lines before showing expand button (default: 25) */
    maxLines?: number;
    /** Stable ID for persisting expand state across re-renders */
    snippetId?: string;
    /** Additional CSS classes on the outer wrapper */
    className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CodeHighlighter({
    codeString,
    language = "tsx",
    showLineNumbers = true,
    maxLines = 25,
    snippetId,
    className,
}: CodeHighlighterProps) {
    const pathname = usePathname();
    const { resolvedTheme } = useTheme();
    const key = snippetId || hashSnippet(codeString + "|" + language);
    const isDarkTheme = resolvedTheme !== "light";
    const syntaxTheme = isDarkTheme ? coldarkDark : coldarkLightLike;

    /* ---- copy state ---- */
    const [copied, setCopied] = useState(false);
    const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    /* ---- expand/collapse state (persisted per route) ---- */
    const [expanded, setExpanded] = useState(
        () => routeExpansionState[pathname]?.[key] ?? false
    );

    useEffect(() => {
        if (!routeExpansionState[pathname]) routeExpansionState[pathname] = {};
        routeExpansionState[pathname][key] = expanded;
    }, [expanded, pathname, key]);

    /* ---- derived ---- */
    const codeLines = codeString?.split("\n").length ?? 0;
    const shouldCollapse = codeLines > maxLines;

    /* ---- handlers ---- */
    const handleCopy = useCallback(async () => {
        if (!codeString) return;
        try {
            await navigator.clipboard.writeText(codeString);
            setCopied(true);
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
            copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard API unavailable — no-op
        }
    }, [codeString]);

    /* ---- render ---- */
    if (!codeString) {
        return (
            <div className="my-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span>No code available for this combination.</span>
            </div>
        );
    }

    return (
        <div className={cn("group relative my-3", className)}>
            {/* Code container */}
            <div
                className="relative overflow-hidden rounded-lg border border-border bg-slate-50 dark:bg-zinc-900"
                style={{
                    maxHeight:
                        shouldCollapse && !expanded
                            ? `calc(1.5rem * ${maxLines} + 2rem)`
                            : "none",
                }}
            >
                <SyntaxHighlighter
                    language={language}
                    style={syntaxTheme}
                    showLineNumbers={showLineNumbers}
                    className="code-highlighter"
                    customStyle={{
                        margin: 0,
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        lineHeight: "1.5rem",
                    }}
                >
                    {codeString}
                </SyntaxHighlighter>

                {/* Gradient fade when collapsed */}
                {shouldCollapse && !expanded && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-linear-to-b from-transparent to-slate-50 dark:to-zinc-900" />
                )}

                {/* Expand/Collapse button */}
                {shouldCollapse && (
                    <button
                        onClick={() => setExpanded((prev) => !prev)}
                        className={cn(
                            "absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-md",
                            "border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground",
                            "transition-colors hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <ChevronsUpDown className="h-3.5 w-3.5" />
                        {expanded ? "Collapse" : "Expand"}
                    </button>
                )}
            </div>

            {/* Copy button */}
            <button
                onClick={handleCopy}
                className={cn(
                    "absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md",
                    "border border-border text-muted-foreground",
                    "opacity-0 transition-all duration-200 group-hover:opacity-100",
                    copied
                        ? "bg-emerald-600/20 text-emerald-400 opacity-100"
                        : "bg-background hover:bg-muted hover:text-foreground"
                )}
                aria-label={copied ? "Copied!" : "Copy code"}
            >
                {copied ? (
                    <Check className="h-3.5 w-3.5" />
                ) : (
                    <Copy className="h-3.5 w-3.5" />
                )}
            </button>
        </div>
    );
}
