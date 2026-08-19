"use client";
import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { TimeframeTabs, TimeframeTabsDivider } from "@registry/new-york/components/timeframe-tabs/timeframe-tabs";
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

/**
 * Example composition: TimeframeTabs (generic) + a shadcn DropdownMenu
 * (attached via the children slot) + domain-specific timeframe data and
 * pinning logic. This is the pattern to copy for any other tab set — swap
 * the items/groups and the trailing content, keep TimeframeTabs as-is.
 */
export default function TimeframeTabsDemo() {
    const [activeTimeframe, setActiveTimeframe] = useState("1H");
    // The one extra pill pinned from the dropdown, if any (e.g. "1D").
    const [customPill, setCustomPill] = useState<string | null>(null);

    const pills =
        customPill && !defaultPills.includes(customPill)
            ? [...defaultPills, customPill]
            : defaultPills;

    const handleDropdownSelect = (value: string) => {
        setActiveTimeframe(value);
        if (!defaultPills.includes(value)) {
            setCustomPill(value);
        }
    };

    return (
        <TimeframeTabs
            items={pills}
            value={activeTimeframe}
            onValueChange={setActiveTimeframe}
            label="Chart timeframe"
        >
            <TimeframeTabsDivider />

            <DropdownMenu>
                <DropdownMenuTrigger
                    aria-label="More timeframes"
                    className="group relative ml-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-medium text-secondary-foreground/60 outline-none cursor-pointer transition-colors duration-150 hover:text-secondary-foreground/90 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:text-secondary-foreground data-[state=open]:bg-muted"
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
                                        className={`cursor-pointer transition-colors duration-150 ${
                                            isActive ? "bg-accent text-accent-foreground" : ""
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
        </TimeframeTabs>
    );
}