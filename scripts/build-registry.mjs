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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const registryConfig = JSON.parse(
  fs.readFileSync(path.join(root, "registry.json"), "utf-8")
);

const OUT_DIR = path.join(root, "public", "r");
fs.mkdirSync(OUT_DIR, { recursive: true });

const registryItems = [];

for (const item of registryConfig.items) {
  const files = item.files.map((file) => {
    const absPath = path.join(root, file.path);
    const content = fs.readFileSync(absPath, "utf-8");
    return { ...file, content };
  });

  const output = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.name,
    title: item.title,
    description: item.description,
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
    title: item.title,
    description: item.description,
    category: item.category,
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
