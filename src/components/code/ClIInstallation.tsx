"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { useCodeOptions } from "@/hooks/useCodeOptions";
import { getComponent } from "@/lib/component-registry";
import { coldarkDarkLike, coldarkLightLike } from "@/lib/code-theme";
import {
  generateInstallCommands,
  getCurrentCommand,
  PKG_MANAGERS,
} from "@/lib/cli-commands";
import type { PackageManager, InstallMode } from "@/hooks/useCodeOptions";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NpmIcon from "@/components/svgs/tools/npm";
import PnpmIcon from "@/components/svgs/tools/pnpm";
import YarnIcon from "@/components/svgs/tools/yarn";
import BunIcon from "@/components/svgs/tools/Bun";

const PKG_ICONS: Record<PackageManager, React.ComponentType<{ className?: string }>> = {
  npm: NpmIcon,
  pnpm: PnpmIcon,
  yarn: YarnIcon,
  bun: BunIcon,
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface CliInstallationProps {
  /** Component slug from the registry (e.g. "shiny-button") */
  slug: string;
  /** Additional CSS classes */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

interface PkgButtonsProps {
  selected: PackageManager;
  onSelect: (pm: PackageManager) => void;
}

function PkgButtons({ selected, onSelect }: PkgButtonsProps) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto">
      {PKG_MANAGERS.map((pm) => {
        const Icon = PKG_ICONS[pm];
        return (
          <button
            key={pm}
            onClick={() => onSelect(pm)}
            className={cn(
              "relative rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 inline-flex items-center gap-1.5",
              selected === pm
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {pm}
          </button>
        );
      })}
    </div>
  );
}

export default function CliInstallation({
  slug,
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

  /* ---- lookup component in registry ---- */
  const component = getComponent(slug);

  const commands = useMemo(() => {
    if (!component) return null;
    return generateInstallCommands(component);
  }, [component]);

  const hasManual = !!commands?.manual;

  /* ---- copy state ---- */
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* ---- current command ---- */
  const currentCommand = useMemo(() => {
    if (!commands) return "";
    return getCurrentCommand(commands, mode, packageManager);
  }, [commands, mode, packageManager]);

  const handleCopy = useCallback(async () => {
    if (!currentCommand) return;
    try {
      await navigator.clipboard.writeText(currentCommand);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }, [currentCommand]);

  /* ---- guards ---- */
  if (!component || !commands) {
    return (
      <div className="my-4 text-sm text-muted-foreground">
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
        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as InstallMode)}
        >
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
      </div>

      {/* Command display */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {/* Package manager tabs */}
        <div className="flex items-center border-b border-border/50 bg-muted/20 px-3 py-2">
          <PkgButtons selected={packageManager} onSelect={setPackageManager} />
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
              "absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-md",
              "border border-border transition-all duration-200",
              copied
                ? "bg-emerald-600/20 text-emerald-400"
                : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
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
