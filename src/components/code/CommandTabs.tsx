"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCodeOptions, type PackageManager } from "@/hooks/useCodeOptions";
import { CLI_PREFIXES, PKG_MANAGERS } from "@/lib/cli-commands";
import { cn } from "@/lib/utils";
import NpmIcon from "@/components/svgs/tools/npm";
import PnpmIcon from "@/components/svgs/tools/pnpm";
import YarnIcon from "@/components/svgs/tools/yarn";
import BunIcon from "@/components/svgs/tools/Bun";
import CodeHighlighter from "./CodeHighlighter";

const PKG_ICONS: Record<
  PackageManager,
  React.ComponentType<{ className?: string }>
> = {
  npm: NpmIcon,
  pnpm: PnpmIcon,
  yarn: YarnIcon,
  bun: BunIcon,
};

interface PkgManagerTabsProps {
  value: PackageManager;
  onValueChange: (manager: PackageManager) => void;
  /** Show brand icons next to each manager name. */
  showIcons?: boolean;
  className?: string;
}

/**
 * Shared package-manager selector. Every command block on the site uses
 * this, so the control looks and behaves identically everywhere.
 */
export function PkgManagerTabs({
  value,
  onValueChange,
  showIcons = false,
  className,
}: PkgManagerTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as PackageManager)}
      className={className}
    >
      <TabsList className="h-8">
        {PKG_MANAGERS.map((manager) => {
          const Icon = PKG_ICONS[manager];
          return (
            <TabsTrigger
              key={manager}
              value={manager}
              className="gap-1.5 px-3 py-1 text-xs"
            >
              {showIcons && <Icon className="h-4 w-4 shrink-0" />}
              {manager}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

interface CommandTabsProps {
  /** Command without the manager prefix, e.g. "shadcn@latest add @kick-ui/shiny-button". */
  command: string;
  /** Unique id scoping copy/expand state for this block. */
  snippetId: string;
  className?: string;
}

/**
 * Package-manager tabbed command block. Shares the persisted manager
 * preference with every other command block on the site, so picking Bun
 * once rewrites all commands. Must render inside a <CodeOptionsProvider>.
 */
export default function CommandTabs({
  command,
  snippetId,
  className,
}: CommandTabsProps) {
  const { packageManager, setPackageManager } = useCodeOptions();

  return (
    <div className={cn("space-y-2", className)}>
      <PkgManagerTabs
        value={packageManager}
        onValueChange={setPackageManager}
      />
      <CodeHighlighter
        language="bash"
        codeString={`${CLI_PREFIXES[packageManager]} ${command}`}
        showLineNumbers={false}
        snippetId={snippetId}
      />
    </div>
  );
}
