import type { SidebarCategory, SidebarItem } from "@/config/Sidebar";

export type { SidebarCategory, SidebarItem };

export interface PropItem {
  name: string;
  type: string;
  default?: string;
  description?: string;
}

export interface ComponentRegistryItem {
  name: string;
  slug: string;
  description: string;
  category: string;
  dependencies: string[];
  registryDependencies: string[];
  installCommand: string;
  usage: string;
  sourceFilename?: string;
  preview: React.ReactNode;
  propsData: PropItem[];
  fullPreview?: boolean;
}

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export type InstallMode = "npx" | "bunx";

export type Language = "ts" | "js";

export type StylePreset = "tailwind" | "css";
