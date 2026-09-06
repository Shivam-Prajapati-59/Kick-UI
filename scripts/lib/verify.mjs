/**
 * Pure pipeline-consistency checks (no filesystem access).
 * Imported by scripts/registry-check.mjs and by tests/.
 * Every function takes plain data and returns a list of human-readable
 * error strings (empty = pass). Error messages name the drifted maps so
 * the fix is obvious without re-running the investigation.
 */

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort();
}

/**
 * Duplicate names collapse silently inside Sets, so membership checks
 * below would pass over ambiguous input (e.g. docSlugs
 * ["pill-card", "pill-card"] matching one registry item). Reject them
 * first, naming the map each duplicate came from.
 */
export function checkDuplicates({ registryNames, docSlugs, demoNames }) {
  const errors = [];
  const sources = [
    ["registry item", registryNames, 'registry.json "items"'],
    ["doc slug", docSlugs, "content/**"],
    ["demo", demoNames, "src/demos"],
  ];
  for (const [label, values, hint] of sources) {
    for (const name of duplicates(values ?? [])) {
      errors.push(
        `duplicate ${label} "${name}" in ${hint}. Names must be unique before membership checks run.`,
      );
    }
  }
  return errors;
}

export function checkIdentity({ registryNames, docSlugs, demoNames }) {
  const errors = [];
  const registry = new Set(registryNames);
  const docs = new Set(docSlugs);
  const demos = new Set(demoNames);

  for (const name of registry) {
    if (!docs.has(name)) {
      errors.push(
        `registry item "${name}" has no doc (expected content/**/${name}.mdx).`,
      );
    }
    if (!demos.has(name)) {
      errors.push(
        `registry item "${name}" has no demo (expected src/demos/${name}.tsx with a default export).`,
      );
    }
  }
  for (const demo of demos) {
    if (!docs.has(demo)) {
      errors.push(
        `demo "${demo}" has no doc (expected content/**/${demo}.mdx).`,
      );
    }
  }
  for (const slug of docs) {
    if (!registry.has(slug)) {
      errors.push(
        `doc "${slug}" has no registry item. Add the source + registry.json entry, or remove the doc.`,
      );
    }
  }
  return errors;
}

export function checkArtifacts({ registryNames, publicNames }) {
  const errors = [];
  const built = new Set(publicNames);
  for (const name of registryNames) {
    if (!built.has(name)) {
      errors.push(
        `registry item "${name}" has no built artifact (run bun registry:build and commit public/r/${name}.json).`,
      );
    }
  }
  const declared = new Set(registryNames);
  for (const name of publicNames) {
    if (!declared.has(name)) {
      errors.push(
        `orphan artifact "public/r/${name}.json" has no registry item. Delete it or re-add the item to registry.json.`,
      );
    }
  }
  return errors;
}

export function checkDemoDefaultExports({ files }) {
  return files
    .filter((file) => !file.hasDefaultExport)
    .map(
      (file) =>
        `demo "src/demos/${file.name}.tsx" has no default export. The generated demo map requires one default export per file.`,
    );
}

export function checkHomepage({ registryHomepage, siteHomepage }) {
  if (registryHomepage !== siteHomepage) {
    return [
      `homepage drift: registry.json says "${registryHomepage}" but src/lib/site-config.ts says "${siteHomepage}". Keep SITE_CONFIG.url in sync.`,
    ];
  }
  return [];
}
