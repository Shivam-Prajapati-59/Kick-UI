"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const timeframeGroups = [
    { label: "Minutes", values: ["1m", "5m", "15m", "30m"] },
    { label: "Hours", values: ["1H", "4H"] },
    { label: "Days", values: ["1D", "1W", "1M"] },
];

// The pills shown by default. Anything picked from the dropdown that isn't
// already here gets pinned on as a single extra "custom" pill.
const defaultPills = ["1m", "5m", "15m", "30m", "1H", "4H"];

const springTransition = { type: "spring", stiffness: 500, damping: 40, mass: 0.6 } as const;

const TimeFrame = () => {
    const [activeTimeframe, setActiveTimeframe] = useState("1H");
    // The one extra pill pinned from the dropdown, if any (e.g. "1D").
    const [customPill, setCustomPill] = useState<string | null>(null);

    const pills =
        customPill && !defaultPills.includes(customPill)
            ? [...defaultPills, customPill]
            : defaultPills;

    const handlePillSelect = (value: string) => setActiveTimeframe(value);

    const handleDropdownSelect = (value: string) => {
        setActiveTimeframe(value);
        if (!defaultPills.includes(value)) {
            setCustomPill(value);
        }
    };

    return (
        <div
            role="tablist"
            aria-label="Chart timeframe"
            className="inline-flex max-w-full items-center gap-1 rounded-lg border bg-transparent p-1"
        >
            <div
                className="flex min-w-0 items-center gap-1 overflow-x-auto scroll-px-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
            >
                <AnimatePresence initial={false}>
                    {pills.map((timeframe) => {
                        const isActive = activeTimeframe === timeframe;

                        return (
                            <motion.button
                                key={timeframe}
                                layout
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.85 }}
                                transition={springTransition}
                                whileTap={{ scale: 0.94 }}
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => handlePillSelect(timeframe)}
                                className="relative shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-medium outline-none cursor-pointer sm:px-3 sm:text-sm focus-visible:ring-2 focus-visible:ring-ring/50"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="timeframe-active-pill"
                                        className="absolute inset-0 rounded-[7px] bg-muted"
                                        transition={springTransition}
                                    />
                                )}
                                <span
                                    className={`relative z-10 transition-colors duration-150 ${isActive
                                        ? "text-secondary-foreground"
                                        : "text-secondary-foreground/60 hover:text-secondary-foreground/90"
                                        }`}
                                >
                                    {timeframe}
                                </span>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="mx-0.5 h-6 w-px shrink-0 bg-border" />

            <DropdownMenu>
                <DropdownMenuTrigger
                    aria-label="More timeframes"
                    className="group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-medium text-secondary-foreground/60 outline-none cursor-pointer transition-colors duration-150 hover:text-secondary-foreground/90 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:text-secondary-foreground data-[state=open]:bg-muted"
                >
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 mt-2">
                    {timeframeGroups.map((group, i) => (
                        <React.Fragment key={group.label}>
                            <DropdownMenuLabel className="text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">
                                {group.label}
                            </DropdownMenuLabel>
                            {group.values.map((value) => {
                                const isActive = activeTimeframe === value;
                                return (
                                    <DropdownMenuItem
                                        key={value}
                                        onSelect={() => handleDropdownSelect(value)}
                                        className={`cursor-pointer transition-colors duration-150 ${isActive ? "bg-accent text-accent-foreground" : ""
                                            }`}
                                    >
                                        {value}
                                        {isActive && <Check className="ml-auto size-4" />}
                                    </DropdownMenuItem>
                                );
                            })}
                            {i !== timeframeGroups.length - 1 && <DropdownMenuSeparator />}
                        </React.Fragment>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default TimeFrame;