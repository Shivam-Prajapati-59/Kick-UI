"use client";

import { ThemeProvider } from "@/components/common/theme-provider";
import Navbar from "@/components/layout/Navbar";

export default function Provider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <Navbar />
            {children}
        </ThemeProvider>
    );
}