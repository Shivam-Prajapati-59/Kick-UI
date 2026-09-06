#!/usr/bin/env node

/**
 * Registry consistency check. Pure verification, never writes.
 * Safe for the lint job: fails fast with messages that name the drifted maps.
 *
 * Covers, in both directions:
 * - registry items <-> docs (slug identity)
 * - registry items <-> demos (src/demos/<slug>.tsx, default export each)
 * - docs without a registry item (allowed only with `distributable: false`)
 * - registry items <-> built artifacts (public/r/<name>.json, no orphans)
 * - registry items <-> components.json local registry list
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { componentDocSchema } from "./component-doc-schema.mjs";
import {
  CONTENT_DIR,
  DEMOS_DIR,
  getDemoNames,
  getDocFiles,
  getPublicNames,
  readComponentsJsonItems,
  readRegistry,
  registryNames,
  root,
} from "./lib/docs.mjs";
import {
  checkArtifacts,
  checkComponentsJson,
  checkDemoDefaultExports,
  checkDistributable,
  checkHomepage,
  checkIdentity,
} from "./lib/verify.mjs";

const registry = readRegistry();
const names = registryNames(registry);

const docs = getDocFiles(CONTENT_DIR).map((filePath) => {
  const slug = path.basename(filePath, ".mdx");
  const { data } = matter(fs.readFileSync(filePath, "utf8"));
  return { slug, ...componentDocSchema.parse(data) };
});

const demoNames = getDemoNames(DEMOS_DIR);const demoFiles = demoNames.map((name) => {
  const source = fs.readFileSync(path.join(DEMOS_DIR, `${name}.tsx`), "utf8");
  return {
    name,
    hasDefaultExport:
      /export\s+default\b/.test(source) ||
      /export\s*\{[^}]*\bdefault\b/.test(source),
  };
});

const cliSource = fs.readFileSync(
  path.join(root, "src", "lib", "cli-commands.ts"),
  "utf8",
);
const cliHomepage = cliSource.match(/REGISTRY_HOMEPAGE\s*=\s*"([^"]+)"/)?.[1];

const errors = [
  ...checkIdentity({
    registryNames: names,
    docSlugs: docs.map((doc) => doc.slug),
    demoNames,
  }),
  ...checkDistributable({ docs, registryNames: names }),
  ...checkDemoDefaultExports({ files: demoFiles }),
  ...checkArtifacts({ registryNames: names, publicNames: getPublicNames() }),
  ...checkComponentsJson({ registryNames: names, componentsJsonItems: readComponentsJsonItems() }),
  ...checkHomepage({ registryHomepage: registry.homepage, cliHomepage }),
];

if (errors.length > 0) {
  for (const error of errors) console.error(`✗ ${error}`);
  console.error(`\n${errors.length} consistency problem(s). Fix the drift above, then rebuild.`);
  process.exit(1);
}

console.log(
  `✓ Registry consistent: ${names.length} items, ${docs.length} docs, ${demoNames.length} demos`,
);
