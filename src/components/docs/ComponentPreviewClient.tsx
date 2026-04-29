"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ShinyButton } from "@/components/ShinnyButton";
import CodeExample, { type CodeVariants } from "@/components/code/CodeExample";
import { motion, AnimatePresence } from "motion/react";

// Registry of preview-able components
const previewComponents: Record<string, React.ReactNode> = {
  "shinny-button": <ShinyButton>Shinny Button</ShinyButton>,
};

const usageExamples: Record<string, string> = {
  "shinny-button": `import { ShinyButton } from "@/components/ShinnyButton";

export default function Example() {
  return <ShinyButton>Shinny Button</ShinyButton>;
}`,
};

interface ComponentPreviewClientProps {
  slug: string;
  sourceCode?: string;
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
  dependencies,
  className,
}: ComponentPreviewClientProps) {
  const [activeTab, setActiveTab] = useState("preview");

  const preview = previewComponents[slug];
  const usage = usageExamples[slug];
  const variants: CodeVariants | undefined = sourceCode
    ? { tsTailwind: sourceCode }
    : undefined;

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
      <TabsList className="bg-muted/50 inline-flex h-9 items-center rounded-lg p-1">
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
              <TabsContent value="preview" className="rounded-lg border border-border" forceMount>
                <div className="flex min-h-50 items-center justify-center p-10">
                  {preview}
                </div>
              </TabsContent>
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
              <TabsContent value="code" forceMount>
                <CodeExample
                  slug={slug}
                  usage={usage}
                  variants={variants}
                  dependencies={dependencies}
                />
              </TabsContent>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Tabs>
  );
}
