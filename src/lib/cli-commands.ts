import type { ComponentRegistryItem } from "./component-registry";
import type { PackageManager, CliTool } from "@/hooks/useCodeOptions";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CliCommands {
  /** Command per package manager, keyed by manager name */
  [manager: string]: string;
}

export interface GeneratedCommands {
  shadcn: CliCommands;
  jsrepo: CliCommands;
  /** null when no dependencies exist (nothing to install manually) */
  manual: CliCommands | null;
}

/* ------------------------------------------------------------------ */
/*  Package manager mapping                                            */
/* ------------------------------------------------------------------ */

const CLI_PREFIXES: Record<PackageManager, string> = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx",
};

const INSTALL_CMDS: Record<PackageManager, string> = {
  npm: "npm install",
  pnpm: "pnpm add",
  yarn: "yarn add",
  bun: "bun add",
};

export const PKG_MANAGERS: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];
export const CLI_TOOLS: CliTool[] = ["shadcn", "jsrepo"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Extracts the registry URL from a full install command.
 * e.g. "npx shadcn@latest add https://..." → "https://..."
 */
function extractRegistryUrl(installCommand: string): string {
  const match = installCommand.match(/https?:\/\/\S+/);
  return match ? match[0] : installCommand;
}

/* ------------------------------------------------------------------ */
/*  Main generator                                                     */
/* ------------------------------------------------------------------ */

/**
 * Generates CLI install commands for every combination of
 * package manager × CLI tool, plus manual dependency install.
 *
 * This is the single source of truth for install commands.
 * Adding a new component to the registry automatically makes
 * all commands available.
 */
export function generateInstallCommands(
  component: ComponentRegistryItem
): GeneratedCommands {
  const registryUrl = extractRegistryUrl(component.installCommand);

  const shadcn: CliCommands = {};
  const jsrepo: CliCommands = {};

  for (const pm of PKG_MANAGERS) {
    shadcn[pm] = `${CLI_PREFIXES[pm]} shadcn@latest add ${registryUrl}`;
    jsrepo[pm] = `${CLI_PREFIXES[pm]} jsrepo@latest add ${registryUrl}`;
  }

  // Manual: install dependencies only (component code is copy-pasted)
  const deps = component.dependencies;
  let manual: CliCommands | null = null;

  if (deps.length > 0) {
    manual = {};
    const depString = deps.join(" ");
    for (const pm of PKG_MANAGERS) {
      manual[pm] = `${INSTALL_CMDS[pm]} ${depString}`;
    }
  }

  return { shadcn, jsrepo, manual };
}

/* ------------------------------------------------------------------ */
/*  Convenience: get the current command for given selections          */
/* ------------------------------------------------------------------ */

export function getCurrentCommand(
  commands: GeneratedCommands,
  mode: "cli" | "manual",
  packageManager: PackageManager,
  cliTool: CliTool
): string {
  if (mode === "manual") {
    return commands.manual?.[packageManager] ?? "";
  }
  return commands[cliTool]?.[packageManager] ?? "";
}
