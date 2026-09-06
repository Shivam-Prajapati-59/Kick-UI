import { describe, expect, test } from "bun:test";
import { componentDocSchema } from "../scripts/component-doc-schema.mjs";
import {
  checkArtifacts,
  checkComponentsJson,
  checkDemoDefaultExports,
  checkDistributable,
  checkDuplicates,
  checkHomepage,
  checkIdentity,
} from "../scripts/lib/verify.mjs";

describe("checkDuplicates", () => {
  test("unique names pass", () => {
    expect(
      checkDuplicates({
        registryNames: ["pill-card"],
        docSlugs: ["pill-card"],
        demoNames: ["pill-card"],
      }),
    ).toEqual([]);
  });

  test("duplicate doc slug is rejected before membership checks", () => {
    const errors = checkDuplicates({
      registryNames: ["pill-card"],
      docSlugs: ["pill-card", "pill-card"],
      demoNames: ["pill-card"],
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('duplicate doc slug "pill-card"');
  });

  test("duplicates in every map are all reported", () => {
    const errors = checkDuplicates({
      registryNames: ["pill-card", "pill-card"],
      docSlugs: ["mag-dock", "mag-dock"],
      demoNames: ["scroll-card", "scroll-card"],
    });
    expect(errors).toHaveLength(3);
    expect(errors.join("\n")).toContain("registry.json");
    expect(errors.join("\n")).toContain("src/demos");
  });
});

describe("checkIdentity", () => {
  test("matching registry, docs and demos pass", () => {
    expect(
      checkIdentity({
        registryNames: ["pill-card", "mag-dock"],
        docSlugs: ["pill-card", "mag-dock"],
        demoNames: ["pill-card", "mag-dock"],
      }),
    ).toEqual([]);
  });

  test("registry item without doc or demo names the missing maps", () => {
    const errors = checkIdentity({
      registryNames: ["pill-card", "ghost"],
      docSlugs: ["pill-card"],
      demoNames: ["pill-card"],
    });
    expect(errors).toHaveLength(2);
    expect(errors.join("\n")).toContain("content/**/ghost.mdx");
    expect(errors.join("\n")).toContain("src/demos/ghost.tsx");
  });

  test("demo without doc is flagged", () => {
    const errors = checkIdentity({
      registryNames: ["pill-card"],
      docSlugs: ["pill-card"],
      demoNames: ["pill-card", "stray"],
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('"stray"');
  });
});

describe("checkDistributable", () => {
  test("doc without registry item fails unless opted out", () => {
    const errors = checkDistributable({
      docs: [{ slug: "wip", distributable: true }],
      registryNames: ["pill-card"],
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("distributable");
  });

  test("opted-out doc passes", () => {
    expect(
      checkDistributable({
        docs: [{ slug: "wip", distributable: false }],
        registryNames: ["pill-card"],
      }),
    ).toEqual([]);
  });
});

describe("checkArtifacts", () => {
  test("missing build and orphan both fail", () => {
    const errors = checkArtifacts({
      registryNames: ["pill-card", "fresh"],
      publicNames: ["pill-card", "dock"],
    });
    expect(errors).toHaveLength(2);
    expect(errors.join("\n")).toContain("bun registry:build");
    expect(errors.join("\n")).toContain("public/r/dock.json");
  });

  test("clean artifacts pass", () => {
    expect(
      checkArtifacts({
        registryNames: ["pill-card"],
        publicNames: ["pill-card"],
      }),
    ).toEqual([]);
  });
});

describe("checkDemoDefaultExports", () => {
  test("demo module without default export fails", () => {
    const errors = checkDemoDefaultExports({
      files: [
        { name: "pill-card", hasDefaultExport: true },
        { name: "broken", hasDefaultExport: false },
      ],
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("src/demos/broken.tsx");
  });
});

describe("checkComponentsJson", () => {
  test("order-insensitive match passes", () => {
    expect(
      checkComponentsJson({
        registryNames: ["b", "a"],
        componentsJsonItems: ["a", "b"],
      }),
    ).toEqual([]);
  });

  test("drift shows both lists", () => {
    const errors = checkComponentsJson({
      registryNames: ["a", "b"],
      componentsJsonItems: ["a"],
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("components.json");
  });
});

describe("checkHomepage", () => {
  const homepage = "https://kick-ui.vercel.app";
  test("matching homepages pass", () => {
    expect(
      checkHomepage({ registryHomepage: homepage, cliHomepage: homepage }),
    ).toEqual([]);
  });

  test("drift names both sources", () => {
    const errors = checkHomepage({
      registryHomepage: homepage,
      cliHomepage: "https://example.com",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("cli-commands.ts");
  });
});

describe("componentDocSchema", () => {
  const valid = {
    title: "Pill Card",
    description: "A card.",
    category: "cards",
    usage: "",
  };

  test("accepts a doc without a demo field and defaults distributable", () => {
    const parsed = componentDocSchema.parse(valid);
    expect(parsed.distributable).toBe(true);
  });

  test("rejects empty title and unknown category", () => {
    expect(() =>
      componentDocSchema.parse({ ...valid, title: "" }),
    ).toThrow();
    expect(() =>
      componentDocSchema.parse({ ...valid, category: "nope" }),
    ).toThrow();
  });
});
