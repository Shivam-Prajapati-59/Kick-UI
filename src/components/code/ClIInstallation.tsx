"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { useCodeOptions } from "@/hooks/useCodeOptions";
import { coldarkDarkLike, coldarkLightLike } from "@/lib/code-theme";
import { unlockSound, useCopyChime } from "@/lib/sound";
import { toast } from "@/components/feedback/Toaster";
import { generateInstallCommands, getCurrentCommand } from "@/lib/cli-commands";
import type { InstallMode } from "@/hooks/useCodeOptions";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/site-config";
import { PkgManagerTabs } from "./CommandTabs";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface CliInstallationProps {
  /** Component slug from the registry (e.g. "pill-button") */
  slug: string;
  registryUrl?: string;
  dependencies: string[];
  /** Additional CSS classes */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

export default function CliInstallation({
  slug,
  registryUrl,
  dependencies,
  className,
}: CliInstallationProps) {
  const { resolvedTheme } = useTheme();
  const {
    installMode: mode,
    setInstallMode: setMode,
    packageManager,
    setPackageManager,
  } = useCodeOptions();
  const syntaxTheme =
    resolvedTheme === "light" ? coldarkLightLike : coldarkDarkLike;

  const commands = useMemo(() => {
    if (!registryUrl) return null;
    return generateInstallCommands({ registryUrl, dependencies });
  }, [dependencies, registryUrl]);

  const hasManual = !!commands?.manual;

  /* ---- copy state ---- */
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copyChime = useCopyChime();

  /* ---- current command ---- */
  const currentCommand = useMemo(() => {
    if (!commands) return "";
    return getCurrentCommand(commands, mode, packageManager);
  }, [commands, mode, packageManager]);

  const handleCopy = useCallback(async () => {
    if (!currentCommand) return;
    void unlockSound();
    try {
      await navigator.clipboard.writeText(currentCommand);
      setCopied(true);
      copyChime.chime();
      toast("Copied to clipboard");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        copyChime.reset();
      }, 2000);
    } catch {
      // clipboard unavailable
    }
  }, [currentCommand, copyChime]);

  /* ---- guards ---- */
  if (!commands) {
    return (
      <div className="text-muted-foreground my-4 text-sm">
        Component &ldquo;{slug}&rdquo; not found in registry.
      </div>
    );
  }

  return (
    <div className={cn("my-6", className)}>
      <h3 className="mb-3 text-base font-semibold tracking-tight">Install</h3>

      {/* Mode tabs (shadcn Tabs) */}
      <div className="mb-2 flex items-center justify-between gap-2">
        {/* Left: shadcn Tabs for CLI / Manual */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as InstallMode)}>
          <TabsList className="h-8">
            <TabsTrigger value="cli" className="px-3 py-1 text-xs">
              CLI
            </TabsTrigger>
            {hasManual ? (
              <TabsTrigger value="manual" className="px-3 py-1 text-xs">
                Manual
              </TabsTrigger>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block">
                    <TabsTrigger
                      value="manual"
                      disabled
                      className="px-3 py-1 text-xs"
                    >
                      Manual
                    </TabsTrigger>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  No dependencies — head to the &ldquo;Code&rdquo; section
                </TooltipContent>
              </Tooltip>
            )}
          </TabsList>
        </Tabs>

        <Button variant="outline" size="sm" asChild>
          <a
            href={`https://v0.dev/chat/api/open?url=${encodeURIComponent(
              `${SITE_CONFIG.url}/r/${slug}.json`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              viewBox="0 0 40 20"
              fill="none"
              aria-hidden="true"
              className="size-3.5"
            >
              <path
                d="M23.3919 0H32.9188C36.7819 0 39.9136 3.13165 39.9136 6.99475V16.0805H36.0006V6.99475C36.0006 6.90167 35.9969 6.80925 35.9898 6.71766L26.4628 16.079C26.4949 16.08 26.5272 16.0805 26.5595 16.0805H36.0006V19.7762H26.5595C22.6964 19.7762 19.4788 16.6139 19.4788 12.7508V3.68923H23.3919V12.7508C23.3919 12.9253 23.4054 13.0977 23.4316 13.2668L33.1682 3.6995C33.0861 3.6927 33.003 3.68923 32.9188 3.68923H23.3919V0Z"
                fill="currentColor"
              />
              <path
                d="M13.7688 19.0956L0 3.68759H5.53933L13.6231 12.7337V3.68759H17.7535V17.5746C17.7535 19.6705 15.1654 20.6584 13.7688 19.0956Z"
                fill="currentColor"
              />
            </svg>
            Open in v0
          </a>
        </Button>
      </div>

      {/* Command display */}
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        {/* Package manager tabs */}
        <div className="border-border/50 bg-muted/20 flex items-center border-b px-3 py-2">
          <PkgManagerTabs
            value={packageManager}
            onValueChange={setPackageManager}
            showIcons
          />
        </div>

        {/* Command + copy */}
        <div className="group relative">
          <SyntaxHighlighter
            language="bash"
            style={syntaxTheme}
            showLineNumbers={false}
            wrapLongLines
            className="code-highlighter"
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: "0.875rem",
              lineHeight: "1.5rem",
            }}
          >
            {currentCommand || "No command available"}
          </SyntaxHighlighter>

          <button
            onClick={handleCopy}
            className={cn(
              "absolute top-1/2 right-3 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md",
              "border-border border transition-all duration-200",
              copied
                ? "bg-emerald-600/20 text-emerald-400"
                : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            aria-label={copied ? "Copied!" : "Copy install command"}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
