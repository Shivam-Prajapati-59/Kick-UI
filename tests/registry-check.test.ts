import { describe, expect, test } from "bun:test";
import { componentDocSchema } from "../src/lib/component-doc-schema.ts";
import {
  checkArtifacts,
  checkDemoDefaultExports,
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

  test("doc without registry item is flagged with no opt-out", () => {
    const errors = checkIdentity({
      registryNames: ["pill-card"],
      docSlugs: ["pill-card", "wip"],
      demoNames: ["pill-card", "wip"],
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('"wip"');
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

describe("checkHomepage", () => {
  const homepage = "https://kick-ui.vercel.app";
  test("matching homepages pass", () => {
    expect(
      checkHomepage({ registryHomepage: homepage, siteHomepage: homepage }),
    ).toEqual([]);
  });

  test("drift names both sources", () => {
    const errors = checkHomepage({
      registryHomepage: homepage,
      siteHomepage: "https://example.com",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("site-config.ts");
  });

  test("components.json template on another domain fails", () => {
    const errors = checkHomepage({
      registryHomepage: homepage,
      siteHomepage: homepage,
      componentsJsonUrl: "https://example.com/r/{name}.json",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("components.json");
  });

  test("components.json template on the same domain passes", () => {
    expect(
      checkHomepage({
        registryHomepage: homepage,
        siteHomepage: homepage,
        componentsJsonUrl: `${homepage}/r/{name}.json`,
      }),
    ).toEqual([]);
  });
});

describe("componentDocSchema", () => {
  const valid = {
    title: "Pill Card",
    description: "A card.",
    category: "cards",
    usage: "",
  };

  test("identity needs no demo field; legacy demo keys are stripped", () => {
    const parsed = componentDocSchema.parse({
      ...valid,
      demo: "pill-card",
    });
    expect("demo" in parsed).toBe(false);
    expect(parsed.title).toBe("Pill Card");
  });

  test("rejects empty title and unknown category", () => {
    expect(() => componentDocSchema.parse({ ...valid, title: "" })).toThrow();
    expect(() =>
      componentDocSchema.parse({ ...valid, category: "nope" }),
    ).toThrow();
  });
});
