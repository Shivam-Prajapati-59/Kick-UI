"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { motion, AnimatePresence } from "framer-motion";
import {
    sidebarCategories,
    type SidebarCategory,
} from "@/config/Sidebar";

// ─── Animation Presets ───────────────────────────────────────────────────────

const spring = { type: "spring" as const, stiffness: 380, damping: 28 };

const staggerContainer = {
    hidden: { opacity: 1 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.06 },
    },
};

const staggerItem = {
    hidden: { opacity: 0, x: -8 },
    show: {
        opacity: 1,
        x: 0,
        transition: { type: "spring" as const, stiffness: 400, damping: 30 },
    },
};

// ─── Nav Item ────────────────────────────────────────────────────────────────

function NavItem({
    path,
    label,
    isActive,
    isHovered,
    setHoveredPath,
    closeMobile,
    enabled,
}: {
    path: string;
    label: string;
    isActive: boolean;
    isHovered: boolean;
    setHoveredPath: (p: string | null) => void;
    closeMobile: () => void;
    enabled?: boolean;
}) {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    // Disabled item
    if (!enabled) {
        return (
            <div
                className="group relative flex items-center px-3 py-1.5 rounded-md text-sm text-muted-foreground/40 cursor-default select-none"
            >
                <span>{label}</span>
            </div>
        );
    }

    return (
        <Link
            href={path}
            onMouseEnter={() => setHoveredPath(path)}
            onMouseLeave={() => setHoveredPath(null)}
            onClick={() => {
                closeMobile();
                scrollToTop();
            }}
            className={cn(
                "group relative flex items-center px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors duration-200",
                isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-primary"
            )}
        >
            {/* Active indicator line */}
            {isActive && (
                <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute w-[2px] h-2.5 bg-primary rounded-full z-10"
                    style={{ left: "-16px", top: "calc(50% - 5px)" }}
                    transition={spring}
                />
            )}

            {/* Hover indicator line */}
            <AnimatePresence>
                {isHovered && !isActive && (
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0.5 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0.5 }}
                        className="absolute w-[2px] h-2.5 bg-primary/50 rounded-full"
                        style={{ left: "-16px", top: "calc(50% - 5px)" }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                )}
            </AnimatePresence>

            {/* Label nudge */}
            <motion.div
                animate={{ x: isHovered && !isActive ? 5 : 0 }}
                transition={spring}
                className="flex items-center gap-2"
            >
                <span>{label}</span>
            </motion.div>
        </Link>
    );
}

// ─── Category Section ────────────────────────────────────────────────────────

function CategorySection({
    category,
    pathname,
    hoveredPath,
    setHoveredPath,
    closeMobile,
}: {
    category: SidebarCategory;
    pathname: string;
    hoveredPath: string | null;
    setHoveredPath: (p: string | null) => void;
    closeMobile: () => void;
}) {
    if (category.items.length === 0) return null;

    return (
        <div>
            {/* Section header — sits ABOVE the vertical line */}
            <div className="mb-1 text-[13px] font-medium text-muted-foreground/50 tracking-[0.08em] select-none">
                {category.title}
            </div>

            {/* Items list with vertical guide line starting from the top */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-0.5 pl-4 pr-2 relative before:absolute before:left-0 before:top-[12px] before:bottom-[12px] before:w-[1.7px] before:bg-white/6"
            >
                {category.items.map((item) => {
                    const path = `${category.basePath}/${item.slug}`;
                    return (
                        <motion.div key={item.slug} variants={staggerItem}>
                            <NavItem
                                path={path}
                                label={item.label}
                                isActive={pathname === path}
                                isHovered={hoveredPath === path}
                                setHoveredPath={setHoveredPath}
                                closeMobile={closeMobile}
                                enabled={item.enabled}
                            />
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}

// ─── Main Sidebar ────────────────────────────────────────────────────────────

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);

    const closeMobile = () => setIsOpen(false);

    const visibleCategories = useMemo(
        () => sidebarCategories.filter((c) => c.items.length > 0),
        []
    );

    const NavigationContent = (
        <div className="relative pb-28">
            <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
            >
                {visibleCategories.map((cat) => (
                    <CategorySection
                        key={cat.title}
                        category={cat}
                        pathname={pathname}
                        hoveredPath={hoveredPath}
                        setHoveredPath={setHoveredPath}
                        closeMobile={closeMobile}
                    />
                ))}
            </motion.div>
        </div>
    );

    return (
        <>
            {/* ─── Mobile Header & Sheet ─────────────────────────────── */}
            <div className="md:hidden w-full flex items-center justify-between pb-4">
                <span className="font-semibold text-sm text-muted-foreground">
                    Components Menu
                </span>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-muted-foreground"
                        >
                            <Menu className="w-4 h-4 mr-2" />
                            Menu
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="w-[300px] bg-background p-0 border-r-white/10"
                    >
                        <SheetHeader className="h-14 border-b border-white/10 flex items-center justify-start px-4">
                            <SheetTitle className="font-bold text-foreground">
                                Kick UI
                            </SheetTitle>
                        </SheetHeader>
                        <div className="h-[calc(100vh-3.5rem)] pt-6 overflow-y-auto scrollbar-hide">
                            {NavigationContent}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* ─── Desktop Sidebar ───────────────────────────────────── */}
            <aside className="hidden md:block w-full h-full relative">
                <div className="h-full relative overflow-hidden">
                    <div className="h-full px-2 overflow-y-auto scrollbar-hide">
                        {NavigationContent}
                    </div>

                    {/* Bottom fade‑out gradient */}
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-background to-transparent pointer-events-none z-10" />
                </div>
            </aside>
        </>
    );
}