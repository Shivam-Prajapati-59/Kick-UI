"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { ShinyButton } from "@/components/ShinnyButton";

// Registry of preview-able components
const previewComponents: Record<string, React.ReactNode> = {
  "shinny-button": <ShinyButton>Shinny Button</ShinyButton>,
};

// Source code for each component (for the Code tab)
const componentSources: Record<string, string> = {
  "shinny-button": `import { ShinyButton } from "@/components/shinny-button";

export default function Example() {
  return <ShinyButton>Shinny Button</ShinyButton>;
}`,
};

interface ComponentPreviewClientProps {
  name: string;
  className?: string;
}

export function ComponentPreviewClient({ name, className }: ComponentPreviewClientProps) {
  const [copied, setCopied] = useState(false);
  const preview = previewComponents[name];
  const source = componentSources[name];

  const handleCopy = async () => {
    if (!source) return;
    await navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!preview) {
    return (
      <div className="my-6 flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border p-10 text-muted-foreground">
        Component &ldquo;{name}&rdquo; not found in preview registry.
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
        <div className="flex min-h-[200px] items-center justify-center p-10">
          {preview}
        </div>
      </TabsContent>

      <TabsContent value="code" className="mt-3">
        <div className="relative group rounded-lg border border-border bg-zinc-950 dark:bg-zinc-900">
          <button
            onClick={handleCopy}
            className={cn(
              "absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md",
              "border border-zinc-700 bg-zinc-800 text-zinc-400",
              "opacity-0 transition-all duration-200 group-hover:opacity-100",
              "hover:bg-zinc-700 hover:text-zinc-200"
            )}
            aria-label="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-zinc-100">
            <code>{source}</code>
          </pre>
        </div>
      </TabsContent>
    </Tabs>
  );
}
