"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { sidebarCategories, sidebarStaticSections } from "@/config/Sidebar";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
};

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
          className={cn("group/toggle flex flex-col gap-1.5", className)}
          size="icon"
          aria-label="Open navigation menu"
        >
          <span className="bg-foreground flex h-0.5 w-5 transform rounded-[1px] transition-transform group-data-[state=open]/toggle:translate-y-2 group-data-[state=open]/toggle:rotate-45" />
          <span className="bg-foreground flex h-0.5 w-5 transform rounded-[1px] transition-opacity group-data-[state=open]/toggle:opacity-0" />
          <span className="bg-foreground flex h-0.5 w-5 transform rounded-[1px] transition-transform group-data-[state=open]/toggle:-translate-y-2 group-data-[state=open]/toggle:-rotate-45" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        overlayClassName="hidden"
        className="bg-background top-16 h-[calc(100dvh-4rem)] w-screen max-w-none gap-0 border-0 p-0 shadow-none sm:max-w-none [&>button:last-child]:hidden"
      >
        <SheetTitle className="sr-only">Site navigation</SheetTitle>
        <div className="flex-1 [scrollbar-gutter:stable] overflow-y-auto px-5 py-6">
          <nav className="w-full max-w-sm space-y-8">
            <section className="space-y-4">
              <h3 className="text-muted-foreground/60 text-xs font-bold tracking-wider uppercase">
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
                      "block py-1 font-mono text-sm font-medium tracking-[0.16em] transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {link.title}
                  </Link>
                );
              })}
            </section>

            {sidebarStaticSections.map((section) => (
              <section key={section.title} className="space-y-4">
                <h3 className="text-muted-foreground/60 text-xs font-bold tracking-wider uppercase">
                  {section.title}
                </h3>
                <div className="space-y-4">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileNav}
                        className={cn(
                          "block py-1 text-sm font-medium tracking-[0.16em] transition-colors",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}

            {sidebarCategories.map((category) => (
              <section key={category.title} className="space-y-4">
                <h3 className="text-muted-foreground/60 text-xs font-bold tracking-wider uppercase">
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
                        className={cn(
                          "block py-1 text-sm font-medium tracking-[0.16em] transition-colors",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
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
