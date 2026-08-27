"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
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

import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { getActiveCategories, type SidebarCategory } from "@/config/Sidebar";

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
}: {
  path: string;
  label: string;
  isActive: boolean;
  isHovered: boolean;
  setHoveredPath: (p: string | null) => void;
  closeMobile: () => void;
}) {
  return (
    <Link
      href={path}
      onMouseEnter={() => setHoveredPath(path)}
      onMouseLeave={() => setHoveredPath(null)}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        closeMobile();
        window.scrollTo({ top: 0 });
      }}
      className={cn(
        "group relative flex cursor-pointer items-center rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
        isActive
          ? "text-primary bg-primary/6 font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
      )}
    >
      {/* Active indicator line */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="bg-primary absolute z-10 h-2.5 w-0.5 rounded-full"
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
            className="bg-primary absolute h-2.5 w-0.5 rounded-full"
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

  const isCategoryActive = category.items.some(
    (item) => pathname === `${category.basePath}/${item.slug}`,
  );

  return (
    <div>
      {/* Section header — sits ABOVE the vertical line */}
      <div
        className={cn(
          "mb-1.5 text-sm font-bold tracking-wider select-none",
          isCategoryActive ? "text-primary" : "text-muted-foreground/60",
        )}
      >
        {category.title}
      </div>

      {/* Items list with vertical guide line starting from the top */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="before:bg-border/70 relative space-y-0.5 pr-2 pl-4 before:absolute before:top-[12px] before:bottom-[12px] before:left-0 before:w-[1.7px]"
      >
        <LayoutGroup>
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
                />
              </motion.div>
            );
          })}
        </LayoutGroup>
      </motion.div>
    </div>
  );
}

// ─── Main Sidebar ────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Reset internal sidebar scroll on navigation so the list doesn't stay pushed up
  useEffect(() => {
    if (desktopScrollRef.current) desktopScrollRef.current.scrollTop = 0;
    if (mobileScrollRef.current) mobileScrollRef.current.scrollTop = 0;
  }, [pathname]);

  const closeMobile = () => setIsOpen(false);

  const visibleCategories = useMemo(() => getActiveCategories(), []);

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
      <div className="flex w-full items-center justify-between pb-4 lg:hidden">
        <span className="text-muted-foreground text-sm font-semibold">
          Components Menu
        </span>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground h-8"
            >
              <Menu className="mr-2 h-4 w-4" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-background border-r-border/10 w-[300px] p-0"
          >
            <SheetHeader className="border-border/10 flex h-14 items-center justify-start border-b px-4">
              <SheetTitle className="text-foreground font-bold">
                Kick UI
              </SheetTitle>
            </SheetHeader>
            <div
              ref={mobileScrollRef}
              className="scrollbar-hide h-[calc(100vh-3.5rem)] overflow-y-auto pt-6"
            >
              {NavigationContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* ─── Desktop Sidebar ───────────────────────────────────── */}
      <aside className="relative hidden h-full w-full lg:block">
        <div className="relative h-full overflow-hidden">
          <div
            ref={desktopScrollRef}
            className="scrollbar-hide h-full overflow-y-auto px-2"
          >
            {NavigationContent}
          </div>

          {/* Bottom fade‑out gradient */}
          <div className="from-background pointer-events-none absolute bottom-0 left-0 z-10 h-24 w-full bg-linear-to-t to-transparent" />
        </div>
      </aside>
    </>
  );
}
