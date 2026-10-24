"use client";

import { useEffect, useState, useId } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { motion, AnimatePresence } from "motion/react";
import { Github, Search, Star } from "lucide-react";

// Internal Config & Components
import { navbarConfig } from "@/config/Navbar";
import { formatStarCount } from "@/lib/github-stars";
import Container from "../common/Container";
import { ThemeToggleButton } from "../custom/ThemeToggle";
import { Button } from "../ui/button";
import { MobileNav } from "./MobileNav";
import { useCommandMenu } from "../command/CommandMenu";

// Extract static derivations outside the component to prevent recreation on every render
const mobileNavItems = navbarConfig.mobileNavItems.map((item) => ({
  title: item.label,
  href: item.href,
}));

export default function Navbar({
  starCount = null,
}: {
  starCount?: number | null;
}) {
  const { setOpen: setMenuOpen } = useCommandMenu();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoverPillId = useId();
  // Blur the navbar only once the page scrolls — at rest it stays fully
  // transparent so the hero gradient shows through cleanly.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 z-50 w-full transition-[backdrop-filter] duration-300 ${scrolled ? "backdrop-blur-xl backdrop-saturate-150" : ""
        }`}
    >
      <Container className="py-3">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div
            >
              <Link
                href="/"
                aria-label="Kick UI home"
                className="flex items-center"
              >
                <Image
                  src={navbarConfig.logo.src}
                  alt={navbarConfig.logo.alt}
                  width={navbarConfig.logo.width}
                  height={navbarConfig.logo.height}
                  className="-translate-y-1.25 rounded-lg transition-opacity"
                  priority
                  loading="eager"
                />
                <span className="text-foreground text-xl font-medium tracking-tight">
                  ick UI
                </span>
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <nav
              className="hidden items-center gap-1 lg:flex"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {navbarConfig.navItems.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className="text-md relative z-10 rounded-md px-3 py-1.5 font-medium transition-colors duration-200"
                >
                  <AnimatePresence>
                    {hoveredIndex === index && (
                      <motion.span
                        layoutId={`${hoverPillId}-nav-hover-pill`}
                        className="absolute inset-0 rounded-md border bg-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          // Increased duration to 0.4s for a slower slide
                          layout: {
                            type: "tween",
                            ease: "easeOut",
                            duration: 0.3,
                          },
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
              onClick={() => setMenuOpen(true)}
              className="group text-muted-foreground hover:text-foreground flex items-center gap-2 py-4"
            >
              <Search className="h-4 w-4" data-icon="inline-start" />
              <span className="hidden sm:inline">Search Components</span>
              <kbd className="border-border bg-muted hidden items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] sm:flex">
                <span>⌘</span>K
              </kbd>
            </Button>

            {/* GitHub link + star count */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="group text-muted-foreground hover:text-foreground hidden items-center gap-2 lg:flex"
            >
              <Link
                href={navbarConfig.links.github}
                target="_blank"
                rel="noreferrer"
                aria-label={
                  starCount === null
                    ? "View Kick UI on GitHub"
                    : `View Kick UI on GitHub — ${starCount.toLocaleString()} ${starCount === 1 ? "star" : "stars"
                    }`
                }
              >
                {/* Lucide rather than public/assets/svgs/github1.svg: the
                    asset hardcodes fill="#161614" and an <image href> cannot
                    inherit currentColor, so it vanishes in dark mode. */}
                <Github className="h-4 w-4" />
                {starCount !== null && (
                  <>
                    {/* Divider — inset from the button padding so it reads as
                        an internal split rather than an outer border. */}
                    <span
                      aria-hidden="true"
                      className="bg-border mx-0.5 h-4 w-px shrink-0"
                    />
                    <Star
                      className="group-hover:text-primary h-3.5 w-3.5 transition-colors"
                      data-icon="inline-start"
                    />
                    <span className="text-sm font-medium tabular-nums">
                      {formatStarCount(starCount)}
                    </span>
                  </>
                )}
              </Link>
            </Button>
            <ThemeToggleButton />

            <div className="lg:hidden">
              <MobileNav items={mobileNavItems} />
            </div>
          </div>
        </div>
      </Container>
    </motion.nav>
  );
}
