/**
 * Shared filesystem access for the registry/docs pipeline.
 * Single implementation of every traversal, imported by
 * build-registry.mjs, build-docs.mjs and registry-check.mjs.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(here, "..", "..");
export const CONTENT_DIR = path.join(root, "content", "components");
export const DEMOS_DIR = path.join(root, "src", "demos");
export const REGISTRY_PATH = path.join(root, "registry.json");
export const PUBLIC_DIR = path.join(root, "public", "r");
export const COMPONENTS_JSON_PATH = path.join(root, "components.json");
export const GENERATED_DIR = path.join(root, "src", "generated");
export const CATEGORIES_TS_PATH = path.join(
  root,
  "src",
  "lib",
  "component-categories.ts",
);

export function readRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
}

export function registryNames(config = readRegistry()) {
  return config.items.map((item) => item.name);
}

/** All MDX doc files, sorted. Replaces the three copied recursive walks. */
export function getDocFiles(directory = CONTENT_DIR) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return getDocFiles(entryPath);
      return entry.name.endsWith(".mdx") ? [entryPath] : [];
    })
    .sort();
}

export function findDocPath(slug, directory = CONTENT_DIR) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const match = findDocPath(slug, entryPath);
      if (match) return match;
    } else if (entry.name === `${slug}.mdx`) {
      return entryPath;
    }
  }
  return undefined;
}

/**
 * Valid demo names, derived from the per-slug demo convention
 * (src/demos/<slug>.tsx). Replaces the DemoRenderer regex parsing:
 * adding a demo is adding a file, nothing to parse.
 */
export function getDemoNames(directory = DEMOS_DIR) {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => path.basename(name, ".tsx"))
    .sort();
}

/** Registry shorthand template from components.json, if present. */
export function readComponentsJsonUrl() {
  const config = JSON.parse(fs.readFileSync(COMPONENTS_JSON_PATH, "utf8"));
  return config.registries?.["@kick-ui"] ?? undefined;
}

/** Built registry artifacts, excluding the collection index. */
export function getPublicNames(directory = PUBLIC_DIR) {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((name) => name.endsWith(".json") && name !== "registry.json")
    .map((name) => path.basename(name, ".json"))
    .sort();
}
