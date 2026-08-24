#!/usr/bin/env node

/**
 * Build script for the shadcn registry.
 *
 * Reads registry.json, resolves each component's source file,
 * and generates the corresponding JSON in public/r/.
 *
 * Hardening added:
 *  - npm dependencies are auto-derived from real import statements.
 *  - registryDependencies are auto-detected from "@/components/ui/*" imports.
 *  - Generated items are validated against the official shadcn schema.
 *  - Stale JSON files are pruned from public/r.
 *  - Missing files fail with a friendly, component-scoped message.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { registryItemSchema, registrySchema } from "shadcn/schema";
import { createComponentDocSchema } from "../src/lib/component-doc-schema.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const registryConfig = JSON.parse(
  fs.readFileSync(path.join(root, "registry.json"), "utf-8"),
);

const OUT_DIR = path.join(root, "public", "r");
const DOCS_DIR = path.join(root, "content", "components");
fs.mkdirSync(OUT_DIR, { recursive: true });
const demoSource = fs.readFileSync(
  path.join(root, "src", "components", "docs", "DemoRenderer.tsx"),
  "utf-8",
);
const demoNames = new Set(
  [...demoSource.matchAll(/^\s*"([^"]+)":\s*dynamic\(/gm)].map(
    (match) => match[1],
  ),
);
const componentDocSchema = createComponentDocSchema(demoNames);

// Framework/builtin packages every React project already provides.
const EXCLUDED_DEPS = new Set(["react", "react-dom", "next"]);
const EXCLUDED_PREFIXES = ["@/", "@registry/", "./", "../"];

/** Extract bare npm package names from import statements. */
function extractDependencies(source) {
  const specifiers = new Set();
  const patterns = [
    /(?:^|\n)\s*import\s+(?:[\s\S]*?)\s+from\s+["']([^"']+)["']/g,
    /(?:^|\n)\s*import\s+["']([^"']+)["']/g,
    /\bimport\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      specifiers.add(match[1]);
    }
  }

  const packages = new Set();
  for (const specifier of specifiers) {
    if (EXCLUDED_PREFIXES.some((p) => specifier.startsWith(p))) continue;
    if (specifier === "next" || specifier.startsWith("next/")) continue;
    if (EXCLUDED_DEPS.has(specifier)) continue;
    // Reduce subpath imports to their bare package name.
    const parts = specifier.split("/");
    const pkg =
      specifier.startsWith("@") && parts.length > 1
        ? parts.slice(0, 2).join("/")
        : parts[0];
    packages.add(pkg);
  }
  return [...packages];
}

/** Detect shadcn ui primitives used via the app alias. */
function extractRegistryDependencies(source) {
  const names = new Set();
  for (const match of source.matchAll(
    /["']@\/components\/ui\/([a-z0-9-]+)["']/g,
  )) {
    names.add(match[1]);
  }
  return [...names];
}

function findDocPath(slug, directory = DOCS_DIR) {
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

const registryItems = [];

for (const item of registryConfig.items) {
  try {
    const docPath = findDocPath(item.name);
    if (!docPath) {
      throw new Error(
        `Missing MDX documentation file "${item.name}.mdx" under content/components/.`,
      );
    }
    const { data } = matter(fs.readFileSync(docPath, "utf-8"));
    const doc = componentDocSchema.parse(data);

    const sources = [];
    let detectedDeps = new Set();
    let detectedRegistryDeps = new Set();
    for (const file of item.files) {
      const absPath = path.join(root, file.path);
      let content;
      try {
        content = fs.readFileSync(absPath, "utf-8").replace(/\r\n?/g, "\n");
      } catch {
        throw new Error(
          `Registry item "${item.name}" declares missing file "${file.path}".`,
        );
      }
      sources.push({ ...file, content });
      extractDependencies(content).forEach((d) => detectedDeps.add(d));
      extractRegistryDependencies(content).forEach((d) =>
        detectedRegistryDeps.add(d),
      );
    }

    // Merge hand-declared + auto-detected dependencies.
    const dependencies = [
      ...new Set([...(item.dependencies ?? []), ...detectedDeps]),
    ].sort();
    const registryDependencies = [
      ...new Set([
        ...(item.registryDependencies ?? []),
        ...detectedRegistryDeps,
      ]),
    ].sort();

    const output = {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: item.name,
      title: doc.title,
      description: doc.description,
      dependencies,
      ...(registryDependencies.length > 0 ? { registryDependencies } : {}),
      files: sources,
      type: item.type,
    };

    const outPath = path.join(OUT_DIR, `${item.name}.json`);

    // Validate against the official shadcn schema before writing.
    const parsed = registryItemSchema.safeParse(output);
    if (!parsed.success) {
      throw new Error(
        `Generated JSON failed shadcn registry-item schema validation: ${parsed.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")}`,
      );
    }

    fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log(`✓ Generated ${item.name}.json`);

    registryItems.push({
      name: item.name,
      type: item.type,
      title: doc.title,
      description: doc.description,
      category: doc.category,
      dependencies,
      ...(registryDependencies.length > 0 ? { registryDependencies } : {}),
      files: item.files,
    });
  } catch (error) {
    console.error(`✗ ${item.name}: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.exitCode === 1) {
  throw new Error("Registry build failed. Fix the errors above and re-run.");
}

// Write the collection index
const registryIndex = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: registryConfig.name,
  homepage: registryConfig.homepage,
  items: registryItems,
};

const indexParsed = registrySchema.safeParse(registryIndex);
if (!indexParsed.success) {
  throw new Error(
    `Registry index failed shadcn schema validation: ${indexParsed.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")}`,
  );
}

fs.writeFileSync(
  path.join(OUT_DIR, "registry.json"),
  JSON.stringify(registryIndex, null, 2),
);
console.log(`✓ Generated registry.json with ${registryItems.length} items`);

// Prune stale JSON artifacts (e.g. components removed from registry.json).
const expected = new Set([
  ...registryConfig.items.map((item) => `${item.name}.json`),
  "registry.json",
]);
let pruned = 0;
for (const entry of fs.readdirSync(OUT_DIR)) {
  if (entry.endsWith(".json") && !expected.has(entry)) {
    fs.unlinkSync(path.join(OUT_DIR, entry));
    console.log(`✓ Pruned stale ${entry}`);
    pruned += 1;
  }
}
if (pruned === 0) console.log("✓ No stale registry artifacts");
