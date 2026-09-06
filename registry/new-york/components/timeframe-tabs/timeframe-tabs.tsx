"use client";
import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

const springTransition = { type: "spring", stiffness: 500, damping: 40, mass: 0.6 } as const;

export interface TimeframeTabsProps {
    /** The pills to render, in order. */
    items: string[];
    /** Currently active pill. */
    value: string;
    /** Called with the pill value when the user clicks one. */
    onValueChange: (value: string) => void;
    /** Optional accessible label for the tablist (defaults to "Tabs"). */
    label?: string;
    className?: string;
    /**
     * Anything rendered after the pill row — a divider, a dropdown menu,
     * a shadcn Tabs trigger, an icon button, whatever the consumer needs.
     * This is what makes the component reusable beyond just timeframes.
     */
    children?: React.ReactNode;
}

/**
 * A scrollable row of pill buttons with an animated active-state highlight.
 * Deliberately has no domain knowledge — pass any `items` list and control
 * it like any other controlled input. Trailing content (dividers, menus,
 * extra actions) goes in `children`.
 */
export function TimeframeTabs({
    items,
    value,
    onValueChange,
    label = "Tabs",
    className,
    children,
}: TimeframeTabsProps) {
    // Unique per-instance id so multiple TimeframeTabs on one page don't
    // share a layout animation namespace.
    const layoutId = React.useId();

    return (
        <div
            role="tablist"
            aria-label={label}
            className={cn(
                "inline-flex max-w-full items-center gap-1 rounded-lg border bg-transparent p-1",
                className
            )}
        >
            <div className="flex min-w-0 items-center gap-1 overflow-x-auto scroll-px-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
                <AnimatePresence initial={false}>
                    {items.map((item) => {
                        const isActive = value === item;

                        return (
                            <motion.button
                                key={item}
                                layout="position"
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.85 }}
                                transition={springTransition}
                                whileTap={{ scale: 0.94 }}
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => onValueChange(item)}
                                className="relative shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-medium outline-none cursor-pointer sm:px-3 sm:text-sm focus-visible:ring-2 focus-visible:ring-ring/50"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId={`timeframe-tabs-active-${layoutId}`}
                                        className="absolute inset-0 rounded-[7px] bg-muted"
                                        transition={springTransition}
                                    />
                                )}
                                <span
                                    className={cn(
                                        "relative z-10 transition-colors duration-150",
                                        isActive
                                            ? "text-secondary-foreground"
                                            : "text-secondary-foreground/60 hover:text-secondary-foreground/90"
                                    )}
                                >
                                    {item}
                                </span>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {children}
        </div>
    );
}

/** Ready-made vertical divider for use inside a TimeframeTabs' children slot. */
export function TimeframeTabsDivider({ className }: { className?: string }) {
    return <div className={cn("mx-1.5 h-6 w-px shrink-0 bg-border", className)} />;
}

export default TimeframeTabs;