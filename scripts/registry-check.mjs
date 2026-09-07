#!/usr/bin/env node

/**
 * Registry consistency check. Pure verification, never writes.
 * Safe for the lint job: fails fast with messages that name the drifted maps.
 *
 * Covers identity in every direction (registry items <-> docs <-> demos),
 * per-demo default exports, built artifacts (no orphans, none missing),
 * and homepage sync. Run with bun (`bun scripts/registry-check.mjs`).
 */
import fs from "fs";
import path from "path";
import {
  CONTENT_DIR,
  DEMOS_DIR,
  getDemoNames,
  getDocFiles,
  getPublicNames,
  readComponentsJsonUrl,
  readRegistry,
  registryNames,
  root,
} from "./lib/docs.mjs";
import {
  checkArtifacts,
  checkDemoDefaultExports,
  checkDuplicates,
  checkHomepage,
  checkIdentity,
} from "./lib/verify.mjs";

const registry = readRegistry();
const names = registryNames(registry);

const docSlugs = getDocFiles(CONTENT_DIR).map((filePath) =>
  path.basename(filePath, ".mdx"),
);

const demoNames = getDemoNames(DEMOS_DIR);
const demoFiles = demoNames.map((name) => {
  const source = fs.readFileSync(path.join(DEMOS_DIR, `${name}.tsx`), "utf8");
  return {
    name,
    hasDefaultExport:
      /export\s+default\b/.test(source) ||
      /export\s*\{[^}]*\bdefault\b/.test(source),
  };
});

const siteConfigSource = fs.readFileSync(
  path.join(root, "src", "lib", "site-config.ts"),
  "utf8",
);
const siteHomepage = siteConfigSource.match(/^\s*url:\s*"([^"]+)"/m)?.[1];

const errors = [
  ...checkDuplicates({ registryNames: names, docSlugs, demoNames }),
  ...checkIdentity({ registryNames: names, docSlugs, demoNames }),
  ...checkDemoDefaultExports({ files: demoFiles }),
  ...checkArtifacts({ registryNames: names, publicNames: getPublicNames() }),
  ...checkHomepage({
    registryHomepage: registry.homepage,
    siteHomepage,
    componentsJsonUrl: readComponentsJsonUrl(),
  }),
];

if (errors.length > 0) {
  for (const error of errors) console.error(`✗ ${error}`);
  console.error(
    `\n${errors.length} consistency problem(s). Fix the drift above, then rebuild.`,
  );
  process.exit(1);
}

console.log(
  `✓ Registry consistent: ${names.length} items, ${docSlugs.length} docs, ${demoNames.length} demos`,
);
