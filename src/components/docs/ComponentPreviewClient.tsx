"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import CodeExample, { type CodeVariants } from "@/components/code/CodeExample";
import { Monitor, RotateCw, Smartphone, Tablet } from "lucide-react";
import { useTheme } from "next-themes";
import PropsTable from "./PropsTable";
import { getPreviewHeight, type PreviewViewport } from "./preview-sizes";
import type { PropItem } from "@/lib/types";

interface ComponentPreviewClientProps {
  slug: string;
  sourceCode?: string;
  sourceFilename?: string;
  dependencies?: string[];
  registryUrl?: string;
  usage?: string;
  propsData?: PropItem[];
  fullPreview?: boolean;
  className?: string;
}

const viewports = [
  { value: "desktop", label: "Desktop", width: null, icon: Monitor },
  { value: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { value: "mobile", label: "Mobile", width: 390, icon: Smartphone },
] as const;

export function ComponentPreviewClient({
  slug,
  sourceCode,
  sourceFilename,
  dependencies,
  registryUrl,
  usage = "",
  propsData = [],
  fullPreview = false,
  className,
}: ComponentPreviewClientProps) {
  const [activeTab, setActiveTab] = useState("preview");
  const [previewKey, setPreviewKey] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [loadedFrame, setLoadedFrame] = useState<string | null>(null);
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { resolvedTheme } = useTheme();
  const selectedWidth = viewports.find(({ value }) => value === viewport)?.width;
  const previewHeight = getPreviewHeight(slug, viewport, fullPreview);
  const frameKey = `${slug}-${previewKey}`;
  const frameLoaded = loadedFrame === frameKey;

  const variants: CodeVariants | undefined = sourceCode
    ? { tsTailwind: sourceCode }
    : undefined;

  const handleReload = useCallback(() => {
    setIsSpinning(true);
    setPreviewKey((k) => k + 1);
  }, []);

  const syncPreviewTheme = useCallback(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "kickui:preview-theme", theme: resolvedTheme },
      window.location.origin,
    );
  }, [resolvedTheme]);

  useEffect(() => {
    syncPreviewTheme();
    const handleReady = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === iframeRef.current?.contentWindow &&
        event.data?.type === "kickui:preview-ready"
      ) {
        setLoadedFrame(frameKey);
        setIsSpinning(false);
        syncPreviewTheme();
      }
    };
    window.addEventListener("message", handleReady);
    iframeRef.current?.contentWindow?.postMessage(
      { type: "kickui:request-preview-ready" },
      window.location.origin,
    );
    return () => window.removeEventListener("message", handleReady);
  }, [frameKey, syncPreviewTheme]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className={cn("my-6 w-full", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
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

        {activeTab === "preview" && (
          <div className="flex items-center gap-2">
            <div
              role="group"
              aria-label="Preview viewport"
              className="bg-muted/50 flex h-9 items-center rounded-lg p-1.5"
            >
              {viewports.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${label} preview`}
                  aria-pressed={viewport === value}
                  title={`${label} preview`}
                  onClick={() => setViewport(value)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    viewport === value && "border-border bg-background text-foreground shadow-sm hover:text-foreground dark:border-input dark:bg-input/30",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleReload}
              aria-label="Reload preview"
              title="Reload preview"
              className="bg-muted/50 flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RotateCw
                className={cn("size-4", isSpinning && "animate-spin")}
                aria-hidden="true"
              />
            </button>
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <TabsContent
          value="preview"
          forceMount
          className={cn(
            "overflow-hidden rounded-xl border border-border bg-muted/20",
            activeTab !== "preview" && "hidden",
          )}
        >
          <div
            className="relative mx-auto w-full bg-background transition-[max-width] duration-300"
            style={{ maxWidth: selectedWidth ?? undefined }}
          >
            <iframe
              ref={iframeRef}
              key={frameKey}
              src={`/preview/${slug}`}
              title={`${slug.replaceAll("-", " ")} ${viewport} preview`}
              onLoad={() => {
                setLoadedFrame(frameKey);
                setIsSpinning(false);
                syncPreviewTheme();
              }}
              style={{ height: previewHeight }}
              className={cn(
                "block w-full border-0 bg-background transition-opacity duration-200",
                frameLoaded ? "opacity-100" : "opacity-0",
              )}
              aria-hidden={!frameLoaded}
            />
          </div>
        </TabsContent>

        {activeTab === "preview" && (
          <div className="mt-12">
            <PropsTable propsData={propsData} />
          </div>
        )}

        {activeTab === "code" && (
          <TabsContent value="code" className="scrollbar-hide" forceMount>
            <CodeExample
              slug={slug}
              usage={usage}
              variants={variants}
              dependencies={dependencies}
              registryUrl={registryUrl}
              sourceFilename={sourceFilename}
            />
          </TabsContent>
        )}
      </div>
    </Tabs>
  );
}
