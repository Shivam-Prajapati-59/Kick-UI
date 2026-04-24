"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ShinyButton } from "@/components/ShinnyButton";
import CodeExample, { type CodeVariants } from "@/components/code/CodeExample";

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

export function ComponentPreviewClient({
  slug,
  sourceCode,
  dependencies,
  className,
}: ComponentPreviewClientProps) {
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
    <Tabs defaultValue="preview" className={cn("my-6 w-full", className)}>
      <TabsList className="bg-muted/50 inline-flex h-9 items-center rounded-lg p-1">
        <TabsTrigger
          value="preview"
          className="rounded-md px-3 py-1 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          Preview
        </TabsTrigger>
        <TabsTrigger
          value="code"
          className="rounded-md px-3 py-1 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          Code
        </TabsTrigger>
      </TabsList>

      <TabsContent value="preview" className="mt-3 rounded-lg border border-border">
        <div className="flex min-h-50 items-center justify-center p-10">
          {preview}
        </div>
      </TabsContent>

      <TabsContent value="code" className="mt-3">
        <CodeExample
          slug={slug}
          usage={usage}
          variants={variants}
          dependencies={dependencies}
        />
      </TabsContent>
    </Tabs>
  );
}
