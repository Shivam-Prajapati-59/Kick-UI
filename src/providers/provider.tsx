"use client";

import { MotionConfig } from "motion/react";
import Navbar from "@/components/layout/Navbar";
import {
  CommandMenu,
  CommandMenuProvider,
} from "@/components/command/CommandMenu";
import { Toaster } from "@/components/feedback/Toaster";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CommandMenuProvider>
        <Navbar />
        <main className="pt-(--navbar-height)">{children}</main>
        <CommandMenu />
        <Toaster />
      </CommandMenuProvider>
    </MotionConfig>
  );
}
