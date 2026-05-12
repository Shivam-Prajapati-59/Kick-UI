"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { sidebarCategories } from "@/config/Sidebar";
import { cn } from "@/lib/utils";

type NavItem = {
    title: string;
    href: string;
}

export function MobileNav({
    items,
    className,
}: {
    items: NavItem[];
    className?: string;
}) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const closeMobileNav = () => setOpen(false);

    return (
        <Sheet open={open} onOpenChange={setOpen} modal={false}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "group/toggle flex flex-col gap-1.5",
                        className
                    )}
                    size="icon"
                    aria-label="Open navigation menu"
                >
                    <span className="flex h-0.5 w-5 transform rounded-[1px] bg-foreground transition-transform group-data-[state=open]/toggle:translate-y-2 group-data-[state=open]/toggle:rotate-45" />
                    <span className="flex h-0.5 w-5 transform rounded-[1px] bg-foreground transition-opacity group-data-[state=open]/toggle:opacity-0" />
                    <span className="flex h-0.5 w-5 transform rounded-[1px] bg-foreground transition-transform group-data-[state=open]/toggle:-translate-y-2 group-data-[state=open]/toggle:-rotate-45" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>

            <SheetContent
                side="left"
                overlayClassName="hidden"
                className="top-16 h-[calc(100dvh-4rem)] w-screen max-w-none gap-0 border-0 bg-background p-0 shadow-none sm:max-w-none [&>button:last-child]:hidden"
            >
                <div className="flex-1 overflow-y-auto px-5 py-6 [scrollbar-gutter:stable]">
                    <nav className="w-full max-w-sm space-y-8">
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                                Get Started
                            </h3>
                            {items.map((link) => {
                                const isActive = pathname === link.href;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={closeMobileNav}
                                        className={cn(
                                            "block py-1 text-sm font-mono font-medium uppercase tracking-[0.16em] transition-colors",
                                            isActive
                                                ? "text-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {link.title}
                                    </Link>
                                );
                            })}
                        </section>

                        {sidebarCategories.map((category) => (
                            <section key={category.title} className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                                    {category.title}
                                </h3>
                                <div className="space-y-4">
                                    {category.items.map((item) => {
                                        const href = `${category.basePath}/${item.slug}`;
                                        const isActive = pathname === href;

                                        return (
                                            <Link
                                                key={href}
                                                href={href}
                                                onClick={closeMobileNav}
                                                aria-disabled={!item.enabled}
                                                className={cn(
                                                    "block py-1 text-sm font-medium uppercase tracking-[0.16em] transition-colors",
                                                    isActive
                                                        ? "text-foreground"
                                                        : "text-muted-foreground hover:text-foreground",
                                                    !item.enabled && "pointer-events-none opacity-40"
                                                )}
                                            >
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    );
}
