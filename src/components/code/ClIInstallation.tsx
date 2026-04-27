"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useCodeOptions } from "@/hooks/useCodeOptions";
import { getComponent } from "@/lib/component-registry";
import { coldarkLightLike } from "@/lib/code-theme";
import {
  generateInstallCommands,
  getCurrentCommand,
  PKG_MANAGERS,
  CLI_TOOLS,
} from "@/lib/cli-commands";
import type { PackageManager, CliTool } from "@/hooks/useCodeOptions";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface CliInstallationProps {
  /** Component slug from the registry (e.g. "shinny-button") */
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
      {PKG_MANAGERS.map((pm) => (
        <button
          key={pm}
          onClick={() => onSelect(pm)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
            selected === pm
              ? "bg-foreground/10 text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {pm}
        </button>
      ))}
    </div>
  );
}

interface CliToolSelectorProps {
  selected: CliTool;
  onSelect: (tool: CliTool) => void;
}

function CliToolSelector({ selected, onSelect }: CliToolSelectorProps) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
      {CLI_TOOLS.map((tool) => (
        <button
          key={tool}
          onClick={() => onSelect(tool)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
            selected === tool
              ? "bg-foreground/10 text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tool}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function CliInstallation({
  slug,
  className,
}: CliInstallationProps) {
  const { resolvedTheme } = useTheme();
  const {
    installMode: mode,
    setInstallMode: setMode,
    cliTool,
    setCliTool,
    packageManager,
    setPackageManager,
  } = useCodeOptions();
  const syntaxTheme = resolvedTheme === "light" ? coldarkLightLike : coldarkDark;

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
    return getCurrentCommand(commands, mode, packageManager, cliTool);
  }, [commands, mode, packageManager, cliTool]);

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

      {/* Mode switch + CLI tool selector */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* CLI button */}
          <button
            onClick={() => setMode("cli")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
              mode === "cli"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            CLI
          </button>

          {/* Manual button (disabled when no deps) */}
          {hasManual ? (
            <button
              onClick={() => setMode("manual")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
                mode === "manual"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Manual
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block">
                  <button
                    disabled
                    className="cursor-not-allowed rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground/50"
                  >
                    Manual
                  </button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                No dependencies — head to the &ldquo;Code&rdquo; section
              </TooltipContent>
            </Tooltip>
          )}

          {/* CLI tool selector (only in CLI mode) */}
          {mode === "cli" && (
            <div className="ml-auto">
              <CliToolSelector selected={cliTool} onSelect={setCliTool} />
            </div>
          )}
        </div>
      </div>

      {/* Command display */}
      <div className="overflow-hidden rounded-lg border border-border bg-slate-50 dark:bg-zinc-900">
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
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              lineHeight: "1.5rem",
            }}
          >
            {currentCommand || "No command available"}
          </SyntaxHighlighter>

          <button
            onClick={handleCopy}
            className={cn(
              "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md",
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
