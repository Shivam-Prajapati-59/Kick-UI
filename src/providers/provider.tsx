"use client";

import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import {
  CommandMenu,
  CommandMenuProvider,
} from "@/components/command/CommandMenu";
import { Toaster } from "@/components/feedback/Toaster";

export default function Provider({
  children,
  starCount = null,
}: {
  children: React.ReactNode;
  /** Resolved on the server in RootLayout; null hides the navbar star badge. */
  starCount?: number | null;
}) {
  const pathname = usePathname();

  // Component previews run in an iframe and need a clean viewport.
  if (pathname.startsWith("/preview/")) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
  }

  return (
    <MotionConfig reducedMotion="user">
      <CommandMenuProvider>
        <Navbar starCount={starCount} />
        <main className="pt-(--navbar-height)">{children}</main>
        <CommandMenu />
        <Toaster />
      </CommandMenuProvider>
    </MotionConfig>
  );
}
