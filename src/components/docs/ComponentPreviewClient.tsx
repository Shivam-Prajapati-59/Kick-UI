"use client";

import React, { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import CodeExample, { type CodeVariants } from "@/components/code/CodeExample";
import { motion, AnimatePresence } from "motion/react";
import { RotateCw } from "lucide-react";
import { getComponent } from "@/lib/component-registry";
import PropsTable from "./PropsTable";

interface ComponentPreviewClientProps {
  slug: string;
  sourceCode?: string;
  sourceFilename?: string;
  dependencies?: string[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Smooth animated tab content wrapper                                */
/* ------------------------------------------------------------------ */

const tabVariants = {
  initial: { opacity: 0, y: 6, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -6, filter: "blur(4px)" },
};

const tabTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

export function ComponentPreviewClient({
  slug,
  sourceCode,
  sourceFilename,
  dependencies,
  className,
}: ComponentPreviewClientProps) {
  const [activeTab, setActiveTab] = useState("preview");
  const [previewKey, setPreviewKey] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const componentData = getComponent(slug);

  const preview = componentData?.preview;
  const usage = componentData?.usage || "";
  const propsData = componentData?.propsData || [];

  const variants: CodeVariants | undefined = sourceCode
    ? { tsTailwind: sourceCode }
    : undefined;

  const handleReload = useCallback(() => {
    setIsSpinning(true);
    setPreviewKey((k) => k + 1);
    setTimeout(() => setIsSpinning(false), 600);
  }, []);

  if (!preview) {
    return (
      <div className="my-6 flex min-h-50 items-center justify-center rounded-lg border border-dashed border-border p-10 text-muted-foreground">
        Component &ldquo;{slug}&rdquo; not found in preview registry.
      </div>
    );
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className={cn("my-6 w-full", className)}
    >
      <TabsList className="bg-muted/50 inline-flex h-12 items-center rounded-lg p-1">
        <TabsTrigger
          value="preview"
          className="rounded-md px-3 py-1 text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          Preview
        </TabsTrigger>
        <TabsTrigger
          value="code"
          className="rounded-md px-3 py-1 text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          Code
        </TabsTrigger>
      </TabsList>

      {/* Animated tab content */}
      <div className="relative mt-3">
        <AnimatePresence mode="wait">
          {activeTab === "preview" && (
            <motion.div
              key="preview"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={tabTransition}
            >
              <TabsContent value="preview" className="relative rounded-xl border border-border overflow-hidden scrollbar-hide" forceMount>
                {/* Reload button — top-right corner */}
                <button
                  onClick={handleReload}
                  aria-label="Reload preview"
                  className={cn(
                    "absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md",
                    "border border-border bg-background text-muted-foreground",
                    "transition-all duration-200 hover:bg-muted hover:text-foreground",
                    "opacity-60 hover:opacity-100"
                  )}
                >
                  <RotateCw
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-500 ease-out",
                      isSpinning && "animate-spin"
                    )}
                  />
                </button>

                <div key={previewKey} className="flex min-h-[350px] items-center justify-center p-10">
                  {preview}
                </div>
              </TabsContent>

              {/* Props table — only visible under Preview tab */}
              <div className="mt-12">
                <PropsTable propsData={propsData} />
              </div>
            </motion.div>
          )}

          {activeTab === "code" && (
            <motion.div
              key="code"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={tabTransition}
            >
              <TabsContent value="code" className="scrollbar-hide" forceMount>
                <CodeExample
                  slug={slug}
                  usage={usage}
                  variants={variants}
                  dependencies={dependencies}
                  sourceFilename={sourceFilename}
                />
              </TabsContent>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Tabs>
  );
}
