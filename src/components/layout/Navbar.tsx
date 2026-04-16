"use client";

import { navbarConfig } from '@/config/Navbar';
import { Link } from 'next-view-transitions';
import { Github, Search } from 'lucide-react';

import Container from '../common/Container';
import { ThemeToggleButton } from '../custom/ThemeToggle';
import { Button } from '../ui/button';
import { MobileNav } from './MobileNav';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
    const [searchOpen, setSearchOpen] = useState(false);

    const mobileNavItems = navbarConfig.navItems.map(item => ({
        title: item.label,
        href: item.href
    }));

    return (
        <Container>
            <nav className="sticky top-0 z-20 rounded-md py-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    {/* Left Side - Logo + Nav Links */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center dark:bg-white rounded-lg">
                            <Image
                                src={navbarConfig.logo.src}
                                alt={navbarConfig.logo.alt}
                                width={navbarConfig.logo.width}
                                height={navbarConfig.logo.height}
                                className='rounded-lg hover:opacity-80 transition-opacity'
                                priority
                            />
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center gap-6">
                            {navbarConfig.navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="relative text-md font-medium
                                transition-colors duration-300
                                                after:absolute after:left-0 after:-bottom-1
                                                after:h-0.5 after:w-0 after:bg-foreground
                                                after:transition-all after:duration-300
                                                hover:text-foreground hover:after:w-full"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
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
                            <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-zinc-700 dark:bg-zinc-800">
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

                        {/* Mobile Navigation */}
                        <div className="md:hidden">
                            <MobileNav items={mobileNavItems} />
                        </div>
                    </div>
                </div>
            </nav >
        </Container>
    );
}