"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Link } from 'next-view-transitions';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Search } from 'lucide-react';

// Internal Config & Components
import { navbarConfig } from '@/config/Navbar';
import Container from '../common/Container';
import { ThemeToggleButton } from '../custom/ThemeToggle';
import { Button } from '../ui/button';
import { MobileNav } from './MobileNav';

// Extract static derivations outside the component to prevent recreation on every render
const mobileNavItems = navbarConfig.navItems.map((item) => ({
    title: item.label,
    href: item.href,
}));

export default function Navbar() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <motion.nav
            className="fixed top-0 left-0 w-full z-50
                       backdrop-blur-xl backdrop-saturate-150"
        >
            <Container className="py-3">
                <div className="flex items-center justify-between">

                    {/* Left Side */}
                    <div className="flex items-center gap-8">

                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                            <Link href="/">
                                <Image
                                    src={navbarConfig.logo.src}
                                    alt={navbarConfig.logo.alt}
                                    width={navbarConfig.logo.width}
                                    height={navbarConfig.logo.height}
                                    className="rounded-lg hover:opacity-80 transition-opacity"
                                    priority
                                />
                            </Link>
                        </motion.div>

                        {/* Desktop Nav Links */}
                        <nav
                            className="hidden md:flex items-center gap-1"
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {navbarConfig.navItems.map((item, index) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    className="relative px-3 py-1.5 text-md font-medium rounded-md
                                               text-foreground/50 hover:text-foreground
                                               transition-colors duration-200 z-10"
                                >
                                    <AnimatePresence>
                                        {hoveredIndex === index && (
                                            <motion.span
                                                layoutId="nav-hover-pill"
                                                className="absolute inset-0 rounded-md bg-transparent border"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{
                                                    // Increased duration to 0.4s for a slower slide
                                                    layout: { type: "tween", ease: "easeOut", duration: 0.3 },
                                                    opacity: { duration: 0.2 },
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>
                                    <span className="relative z-20">{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center gap-2">
                        {/* Search Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            aria-label="Search"
                            onClick={() => setSearchOpen(true)}
                            className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 py-4" >
                            <Search className="h-4 w-4" />
                            <span className="hidden sm:inline">Search Components</span>
                            <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-[10px] dark:border-zinc-700 dark:bg-zinc-800">
                                <span>⌘</span>K
                            </kbd>
                        </Button>

                        {/* Theme Toggle */}
                        <Button
                            variant="outline"
                            size="icon"
                            className=" text-sm font-medium"
                        >
                            <Github />
                        </Button>
                        <ThemeToggleButton />

                        <div className="md:hidden">
                            <MobileNav items={mobileNavItems} />
                        </div>
                    </div>
                </div>
            </Container>
        </motion.nav>
    );
}