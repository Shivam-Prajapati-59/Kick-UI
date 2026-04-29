"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { Check, Copy, ChevronDown } from "lucide-react";
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
import type { PackageManager, CliTool, InstallMode } from "@/hooks/useCodeOptions";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShadcnIcon from "@/components/svgs/libraries/ShadcnIcon";
import JsRepoIcon from "@/components/svgs/tools/JsRepo";

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
            "relative rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
            selected === pm
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {pm}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CLI Tool Dropdown (shadcn / jsrepo) with SVG icons                 */
/* ------------------------------------------------------------------ */

const CLI_TOOL_CONFIG: Record<CliTool, { label: string; icon: React.ReactNode }> = {
  shadcn: { label: "shadcn", icon: <ShadcnIcon className="w-4.5! h-4.5!" /> },
  jsrepo: { label: "jsrepo", icon: <JsRepoIcon className="w-4.5 h-4.5" /> },
};

interface CliToolDropdownProps {
  selected: CliTool;
  onSelect: (tool: CliTool) => void;
}

function CliToolDropdown({ selected, onSelect }: CliToolDropdownProps) {
  const [open, setOpen] = useState(false);
  const activeConfig = CLI_TOOL_CONFIG[selected];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-lg border border-border",
            "bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground",
            "transition-all duration-200 hover:bg-muted hover:border-border/80"
          )}
        >
          <span className="flex items-center gap-1.5">
            {activeConfig.icon}
            <span>{activeConfig.label}</span>
          </span>
          <ChevronDown
            className={cn(
              "h-3 w-3 text-muted-foreground transition-transform duration-300 ease-out",
              open && "rotate-180"
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuRadioGroup
          value={selected}
          onValueChange={(v) => onSelect(v as CliTool)}
        >
          {(Object.keys(CLI_TOOL_CONFIG) as CliTool[]).map((tool) => (
            <DropdownMenuRadioItem key={tool} value={tool}>
              {CLI_TOOL_CONFIG[tool].icon}
              <span>{CLI_TOOL_CONFIG[tool].label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

import React from "react";

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

      {/* Mode tabs (shadcn Tabs) + CLI tool dropdown */}
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

        {/* Right: CLI tool dropdown (only in CLI mode) */}
        {mode === "cli" && (
          <CliToolDropdown selected={cliTool} onSelect={setCliTool} />
        )}
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
