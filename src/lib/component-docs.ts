import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  componentDocSchema,
  type ComponentDocFrontmatter,
} from "./component-doc-schema.ts";
import type { ComponentCategory } from "@/lib/component-categories";
import type { PropItem } from "@/lib/types";

import { componentCategories } from "@/lib/component-categories";

const contentDirectory = path.join(process.cwd(), "content", "components");
const registryPath = path.join(process.cwd(), "registry.json");

interface RegistryFile {
  path: string;
}

interface RegistryItem {
  name: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
}

interface RegistryConfig {
  homepage: string;
  items: RegistryItem[];
}

export interface ComponentDoc extends ComponentDocFrontmatter {
  slug: string;
  body: string;
  dependencies: string[];
  registryDependencies: string[];
  registryUrl?: string;
  sourceFilename?: string;
  sourceCode?: string;
}

function getRegistryConfig(): RegistryConfig {
  return JSON.parse(fs.readFileSync(registryPath, "utf8")) as RegistryConfig;
}

function getRegistryItem(slug: string) {
  return getRegistryConfig().items.find((item) => item.name === slug);
}

function getDocFiles(directory = contentDirectory): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return getDocFiles(entryPath);
    return entry.name.endsWith(".mdx") ? [entryPath] : [];
  });
}

function parseDoc(filePath: string): ComponentDoc {
  const slug = path.basename(filePath, ".mdx");
  const parsed = matter(fs.readFileSync(filePath, "utf8"));
  const frontmatter = componentDocSchema.parse(parsed.data);
  const registryItem = getRegistryItem(slug);
  const sourcePath = registryItem?.files[0]?.path;
  const sourceCode = sourcePath
    ? fs.readFileSync(path.join(process.cwd(), sourcePath), "utf8")
    : undefined;

  return {
    ...frontmatter,
    slug,
    body: parsed.content,
    dependencies: registryItem?.dependencies ?? [],
    registryDependencies: registryItem?.registryDependencies ?? [],
    registryUrl: registryItem
      ? `${getRegistryConfig().homepage}/r/${registryItem.name}.json`
      : undefined,
    sourceFilename: sourcePath
      ? `components/ui/${path.basename(sourcePath)}`
      : undefined,
    sourceCode,
  };
}

export function getAllComponentDocs(): ComponentDoc[] {
  if (!fs.existsSync(contentDirectory)) return [];
  return getDocFiles().sort().map(parseDoc);
}

export function getComponentDoc(slug: string): ComponentDoc | undefined {
  return getAllComponentDocs().find((doc) => doc.slug === slug);
}

export function getComponentDocsByCategory() {
  const groups = Object.fromEntries(
    componentCategories.map((category) => [category.id, [] as ComponentDoc[]]),
  ) as Record<ComponentCategory, ComponentDoc[]>;
  return getAllComponentDocs().reduce((acc, doc) => {
    acc[doc.category].push(doc);
    return acc;
  }, groups);
}

export function getProps(props: ComponentDoc["props"]): PropItem[] {
  return props;
}
