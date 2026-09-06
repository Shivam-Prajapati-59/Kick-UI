#!/usr/bin/env node

/**
 * Build script for the shadcn registry.
 *
 * Reads registry.json, resolves each component's source file,
 * and generates the corresponding JSON in public/r/.
 *
 * Also writes public/r/registry.json as the collection index.
 *
 * Consistency between registry items, docs, demos and artifacts is
 * enforced separately by scripts/registry-check.mjs (pure check, CI-safe).
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { componentDocSchema } from "./component-doc-schema.mjs";
import { PUBLIC_DIR, findDocPath, readRegistry, root } from "./lib/docs.mjs";

const registryConfig = readRegistry();

fs.mkdirSync(PUBLIC_DIR, { recursive: true });

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

  const outPath = path.join(PUBLIC_DIR, `${item.name}.json`);
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
  path.join(PUBLIC_DIR, "registry.json"),
  JSON.stringify(registryIndex, null, 2)
);
console.log(`✓ Generated registry.json with ${registryItems.length} items`);
