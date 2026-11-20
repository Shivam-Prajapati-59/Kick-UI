"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import CodeExample, { type CodeVariants } from "@/components/code/CodeExample";
import {
  Maximize2,
  Minimize2,
  Monitor,
  RotateCw,
  Smartphone,
  Tablet,
} from "lucide-react";
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

// Safari desktop still ships the prefixed element fullscreen API.
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type FullscreenElement = HTMLDivElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenFailed, setFullscreenFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);
  const exitButtonRef = useRef<HTMLButtonElement>(null);
  const skipFocusOnMount = useRef(false);
  const fullscreenRequestRef = useRef(false);
  const { resolvedTheme } = useTheme();
  const selectedWidth = viewports.find(
    ({ value }) => value === viewport,
  )?.width;
  const previewHeight = getPreviewHeight(slug, viewport, fullPreview);
  const frameKey = `${slug}-${previewKey}`;
  const frameLoaded = loadedFrame === frameKey;

  const variants: CodeVariants | undefined = sourceCode
    ? { tsTailwind: sourceCode }
    : undefined;

  const handleReload = useCallback(() => {
    setIsSpinning(true);
    setFullscreenFailed(false);
    setPreviewKey((k) => k + 1);
  }, []);

  const openPreviewTab = useCallback(() => {
    window.open(`/preview/${slug}`, "_blank", "noopener");
  }, [slug]);

  const handleFullscreen = useCallback(() => {
    const container = containerRef.current as FullscreenElement | null;
    if (!container) return;
    const request = container.requestFullscreen
      ? container.requestFullscreen.bind(container)
      : container.webkitRequestFullscreen?.bind(container);
    if (!request) {
      openPreviewTab();
      return;
    }
    fullscreenRequestRef.current = true;
    try {
      Promise.resolve(request()).catch(() => {
        fullscreenRequestRef.current = false;
        setFullscreenFailed(true);
      });
    } catch {
      fullscreenRequestRef.current = false;
      setFullscreenFailed(true);
    }
  }, [openPreviewTab]);

  const handleExitFullscreen = useCallback(() => {
    const doc = document as FullscreenDocument;
    if (doc.fullscreenElement) void doc.exitFullscreen?.();
    else if (doc.webkitFullscreenElement) void doc.webkitExitFullscreen?.();
  }, []);

  const handleFullscreenChange = useCallback(() => {
    const doc = document as FullscreenDocument;
    const active =
      (doc.fullscreenElement ?? doc.webkitFullscreenElement) ===
      containerRef.current;
    if (active) {
      fullscreenRequestRef.current = false;
      setFullscreenFailed(false);
    }
    setIsFullscreen(active);
  }, []);

  useEffect(() => {
    const doc: EventTarget = document;
    doc.addEventListener("fullscreenchange", handleFullscreenChange);
    doc.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      doc.removeEventListener("fullscreenchange", handleFullscreenChange);
      doc.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  // A failed request only reaches us as an event in some browsers, so gate it
  // on the request we made; the toolbar link is the fallback instead of window.open.
  useEffect(() => {
    const doc: EventTarget = document;
    const handleFullscreenError = () => {
      if (!fullscreenRequestRef.current) return;
      fullscreenRequestRef.current = false;
      setFullscreenFailed(true);
    };
    doc.addEventListener("fullscreenerror", handleFullscreenError);
    doc.addEventListener("webkitfullscreenerror", handleFullscreenError);
    return () => {
      fullscreenRequestRef.current = false;
      doc.removeEventListener("fullscreenerror", handleFullscreenError);
      doc.removeEventListener("webkitfullscreenerror", handleFullscreenError);
    };
  }, []);

  useEffect(() => {
    if (!skipFocusOnMount.current) {
      skipFocusOnMount.current = true;
      return;
    }
    if (isFullscreen) exitButtonRef.current?.focus();
    else fullscreenButtonRef.current?.focus();
  }, [isFullscreen]);

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
      onValueChange={(value) => {
        setFullscreenFailed(false);
        setActiveTab(value);
      }}
      className={cn("my-6 w-full", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList className="bg-muted/50 inline-flex h-12 items-center rounded-lg p-1">
          <TabsTrigger
            value="preview"
            className="data-[state=active]:bg-background rounded-md px-3 py-1 text-sm font-medium transition-all duration-200 data-[state=active]:shadow-sm"
          >
            Preview
          </TabsTrigger>
          <TabsTrigger
            value="code"
            className="data-[state=active]:bg-background rounded-md px-3 py-1 text-sm font-medium transition-all duration-200 data-[state=active]:shadow-sm"
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
                  onClick={() => {
                    setFullscreenFailed(false);
                    setViewport(value);
                  }}
                  className={cn(
                    "text-muted-foreground hover:text-foreground focus-visible:ring-ring flex size-8 items-center justify-center rounded-md border border-transparent transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    viewport === value &&
                      "border-border bg-background text-foreground hover:text-foreground dark:border-input dark:bg-input/30 shadow-sm",
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
              className="bg-muted/50 text-muted-foreground hover:text-foreground focus-visible:ring-ring flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <RotateCw
                className={cn("size-4", isSpinning && "animate-spin")}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              ref={fullscreenButtonRef}
              onClick={handleFullscreen}
              aria-label="Fullscreen preview"
              title="Fullscreen preview"
              className="bg-muted/50 text-muted-foreground hover:text-foreground focus-visible:ring-ring flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Maximize2 className="size-4" aria-hidden="true" />
            </button>
            {fullscreenFailed && (
              <a
                href={`/preview/${slug}`}
                target="_blank"
                rel="noopener"
                className="bg-muted/50 text-muted-foreground hover:text-foreground focus-visible:ring-ring flex h-9 items-center rounded-lg px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Open preview in new tab
              </a>
            )}
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <TabsContent
          ref={containerRef}
          value="preview"
          forceMount
          className={cn(
            "border-border bg-muted/20 relative overflow-hidden rounded-xl border",
            isFullscreen &&
              "bg-background h-screen w-screen rounded-none border-0",
            activeTab !== "preview" && "hidden",
          )}
        >
          {isFullscreen && (
            <button
              type="button"
              ref={exitButtonRef}
              onClick={handleExitFullscreen}
              aria-label="Exit fullscreen"
              title="Exit fullscreen"
              className="border-border bg-background/80 text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-lg border shadow-sm backdrop-blur transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Minimize2 className="size-4" aria-hidden="true" />
            </button>
          )}
          <div
            className="bg-background relative mx-auto w-full transition-[max-width] duration-300"
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
              style={{ height: isFullscreen ? "100vh" : previewHeight }}
              className={cn(
                "bg-background block w-full border-0 transition-opacity duration-200",
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
