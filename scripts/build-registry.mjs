#!/usr/bin/env node

/**
 * Build script for the shadcn registry.
 *
 * Reads registry.json, resolves each component's source file,
 * and generates the corresponding JSON in public/r/.
 *
 * Also writes public/r/registry.json as the collection index.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { createComponentDocSchema } from "./component-doc-schema.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const registryConfig = JSON.parse(
  fs.readFileSync(path.join(root, "registry.json"), "utf-8")
);

const OUT_DIR = path.join(root, "public", "r");
const DOCS_DIR = path.join(root, "content", "components");
fs.mkdirSync(OUT_DIR, { recursive: true });
const demoSource = fs.readFileSync(
  path.join(root, "src", "components", "docs", "DemoRenderer.tsx"),
  "utf-8",
);
const demoNames = new Set(
  [...demoSource.matchAll(/^\s*"([^"]+)":\s*dynamic\(/gm)].map((match) => match[1]),
);
const componentDocSchema = createComponentDocSchema(demoNames);

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
  const docPath = findDocPath(item.name);
  if (!docPath) {
    throw new Error(`Missing MDX documentation for registry item "${item.name}".`);
  }
  const { data } = matter(fs.readFileSync(docPath, "utf-8"));
  const doc = componentDocSchema.parse(data);
  const files = item.files.map((file) => {
    const absPath = path.join(root, file.path);
    const content = fs.readFileSync(absPath, "utf-8").replace(/\r\n?/g, "\n");
    return { ...file, content };
  });

  const output = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.name,
    title: doc.title,
    description: doc.description,
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies,
    files,
    type: item.type,
  };

  const outPath = path.join(OUT_DIR, `${item.name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`✓ Generated ${item.name}.json`);

  registryItems.push({
    name: item.name,
    type: item.type,
    title: doc.title,
    description: doc.description,
    category: doc.category,
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies,
    files: item.files,
  });
}

// Write the collection index
const registryIndex = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: registryConfig.name,
  homepage: registryConfig.homepage,
  items: registryItems,
};

fs.writeFileSync(
  path.join(OUT_DIR, "registry.json"),
  JSON.stringify(registryIndex, null, 2)
);
console.log(`✓ Generated registry.json with ${registryItems.length} items`);
