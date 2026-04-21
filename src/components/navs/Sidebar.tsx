"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

// --- Constants ---
const CATEGORIES = [
    { name: "Text Animations", subcategories: ["Split Text", "Blur Text", "Shiny Text"] },
    { name: "UI Components", subcategories: ["Buttons", "Cards", "Backgrounds", "Text"] }
];
const NEW = ["Split Text"];
const UPDATED = ["Shiny Text"];
const TOOLS = [{ id: 1, label: "Theme Builder", path: "/theme", icon: Sparkles }];

// --- Utility Functions ---
const scrollToTop = () => window.scrollTo(0, 0);
const slug = (str: string) => str.replace(/\s+/g, '-').toLowerCase();

// --- Reusable Nav Item Component ---
const NavItem = ({
    path, label, isActive, isHovered, setHoveredPath, setIsOpen, isNew, isUpdated, icon: Icon, isTool
}: any) => {
    return (
        <Link
            href={path}
            onMouseEnter={() => setHoveredPath(path)}
            onMouseLeave={() => setHoveredPath(null)}
            onClick={() => { setIsOpen(false); scrollToTop(); }}
            className={cn(
                "group relative flex items-center justify-between px-3 py-1.5 rounded-md text-sm cursor-pointer transition-all duration-300",
                isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-primary",
                isTool && !isActive && "hover:bg-white/5 hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(169,85,247,0.15)]"
            )}
        >
            {/* Active Line - Fixed positioning for smooth layout animations */}
            {isActive && (
                <motion.div
                    layoutId="sidebar-active-line"
                    className="absolute w-[2px] h-4 bg-primary rounded-full z-10"
                    style={{ left: "-17px", top: "calc(50% - 6px)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
            )}

            {/* Hover Line - Fixed positioning */}
            {isHovered && !isActive && (
                <motion.div
                    layoutId="sidebar-hover-line"
                    className="absolute w-[2px] h-4 bg-primary/40 rounded-full"
                    style={{ left: "-17px", top: "calc(50% - 8px)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
            )}

            {/* Text & Icons container with slight nudge on hover */}
            <motion.div
                animate={{ x: isHovered && !isActive ? 4 : 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="flex items-center gap-2"
            >
                {Icon && <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-primary/70")} />}
                <span>{label}</span>

                {/* Badges */}
                {isNew && <span className="ml-[0.2em] text-[10px] leading-none rounded-[6px] font-semibold py-[0.4em] px-[0.6em] font-mono text-[#d8aeff] border border-primary bg-[#a955f7]/40 tracking-wider">NEW</span>}
                {isUpdated && <span className="ml-[0.2em] text-[10px] leading-none rounded-[6px] font-semibold py-[0.4em] px-[0.6em] font-mono text-[#cdcdcd] border border-white/30 bg-white/20 tracking-wider">UPDATED</span>}
            </motion.div>
        </Link>
    );
};

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);

    const NavigationContent = (
        <div className="relative pb-24">
            <div className="space-y-6">
                {CATEGORIES.map((cat, i) => (
                    <div key={cat.name}>
                        {/* Category Header */}
                        <div className="px-4 mb-2 text-xs font-medium text-muted-foreground/70 tracking-wide uppercase">
                            {cat.name}
                        </div>

                        {/* Category Items */}
                        <div className="space-y-0.5 pl-4 pr-2 border-l border-white/10 relative">
                            {cat.subcategories.map((sub) => {
                                const path = `/${slug(cat.name)}/${slug(sub)}`;
                                return (
                                    <NavItem
                                        key={path}
                                        path={path}
                                        label={sub}
                                        isActive={pathname === path}
                                        isHovered={hoveredPath === path}
                                        setHoveredPath={setHoveredPath}
                                        setIsOpen={setIsOpen}
                                        isNew={NEW.includes(sub)}
                                        isUpdated={UPDATED.includes(sub)}
                                    />
                                );
                            })}
                        </div>

                        {/* Tools Section injected after first category */}
                        {i === 0 && (
                            <div className="mt-8 mb-6">
                                <Separator className="my-4 bg-white/10" />
                                <div className="px-4 mb-2 text-xs font-medium text-muted-foreground/70 tracking-wide uppercase">
                                    Tools
                                </div>
                                <div className="space-y-0.5 pl-4 pr-2 border-l border-white/10 relative">
                                    {TOOLS.map((tool) => (
                                        <NavItem
                                            key={tool.path}
                                            path={tool.path}
                                            label={tool.label}
                                            icon={tool.icon}
                                            isActive={pathname === tool.path}
                                            isHovered={hoveredPath === tool.path}
                                            setHoveredPath={setHoveredPath}
                                            setIsOpen={setIsOpen}
                                            isTool={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Useful Links */}
            <div className="mt-8">
                <Separator className="my-4 bg-white/10" />
                <div className="px-4 mb-2 text-xs font-medium text-muted-foreground/70 tracking-wide uppercase">
                    Useful Links
                </div>
                <div className="space-y-1 px-4">
                    <Link
                        href="https://github.com"
                        target="_blank"
                        className="group flex items-center justify-between text-sm text-muted-foreground border border-transparent hover:border-white/10 hover:bg-white/5 hover:text-primary px-3 py-2 rounded-md transition-all duration-300"
                    >
                        <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">GitHub</span>
                        <ArrowRight className="w-3.5 h-3.5 -rotate-45 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header & Sheet */}
            <div className="md:hidden w-full flex items-center justify-between pb-4">
                <span className="font-semibold text-sm text-muted-foreground">Components Menu</span>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-muted-foreground">
                            <Menu className="w-4 h-4 mr-2" />
                            Menu
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] bg-background p-0 border-r-white/10">
                        <SheetHeader className="h-14 border-b border-white/10 flex items-center justify-start px-4">
                            <SheetTitle className="font-bold text-foreground">Logo</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100vh-3.5rem)] pt-6">
                            {NavigationContent}
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-full h-full relative border-r border-white/5">
                <div className="h-full relative overflow-hidden">
                    <ScrollArea className="h-full px-2">
                        {NavigationContent}
                    </ScrollArea>

                    {/* Bottom fade out gradient */}
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
                </div>
            </aside>
        </>
    );
}