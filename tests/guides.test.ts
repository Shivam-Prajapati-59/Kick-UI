import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { componentIndex } from "../src/generated/component-index";
import { parseGuideInline } from "../src/components/docs/GuidePage";
import registryConfig from "../registry.json";
import componentsConfig from "../components.json";
import {
  guideHref,
  guideSections,
  getGuidePage,
  type GuideBlock,
} from "../src/config/docs";
import { sidebarStaticSections } from "../src/config/Sidebar";

const pages = guideSections.flatMap((section) => section.pages);

function renderedText(nodes: unknown): string {
  return JSON.stringify(nodes);
}

describe("guide registry integrity", () => {
  test("slugs are unique", () => {
    const slugs = pages.map((page) => page.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("titles and descriptions are present and audit-sized", () => {
    for (const page of pages) {
      expect(page.title.length).toBeGreaterThan(0);
      expect(page.description.length).toBeGreaterThanOrEqual(70);
      expect(page.description.length).toBeLessThanOrEqual(185);
    }
  });

  test("every guide has at least one section with content", () => {
    for (const page of pages) {
      expect(page.sections.length).toBeGreaterThan(0);
      for (const section of page.sections) {
        expect(section.heading.length).toBeGreaterThan(0);
        expect(section.blocks.length).toBeGreaterThan(0);
      }
    }
  });

  test("snippet modes and commands are well-formed", () => {
    const modes = ["terminal", "text", "javascript", "json", "css", "tsx"];
    const snippetIds: string[] = [];
    const collect = (blocks: GuideBlock[]) => {
      for (const block of blocks) {
        if (block.kind === "snippet") {
          expect(modes.includes(block.snippet.mode)).toBe(true);
          expect(block.snippet.code.length).toBeGreaterThan(0);
        }
        if (block.kind === "command") {
          expect(block.command.command.length).toBeGreaterThan(0);
          snippetIds.push(block.command.snippetId);
        }
      }
    };
    for (const page of pages) {
      for (const section of page.sections) collect(section.blocks);
    }
    expect(new Set(snippetIds).size).toBe(snippetIds.length);
  });

  test("every config slug has a page file", () => {
    for (const page of pages) {
      const file = path.join(
        import.meta.dirname,
        "..",
        "src",
        "app",
        "(browse)",
        "docs",
        page.slug,
        "page.tsx",
      );
      expect(fs.existsSync(file)).toBe(true);
    }
  });

  test("unknown slugs fail fast", () => {
    expect(() => getGuidePage("nope")).toThrow();
  });
});

describe("sidebar guide links resolve", () => {
  test("every static href is external, a guide, or a component", () => {
    const guideHrefs = new Set(pages.map((page) => guideHref(page.slug)));
    const componentHrefs = new Set(
      componentIndex.map((component) => `/components/${component.slug}`),
    );
    for (const section of sidebarStaticSections) {
      for (const item of section.items) {
        const ok =
          item.href.startsWith("http") ||
          guideHrefs.has(item.href) ||
          componentHrefs.has(item.href);
        expect(ok).toBe(true);
      }
    }
  });
});

describe("parseGuideInline", () => {
  test("renders code spans", () => {
    const out = renderedText(parseGuideInline("Use `cn` here"));
    expect(out).toContain("cn");
    expect(out).toContain("code");
  });

  test("renders internal links as client navigation", () => {
    const out = renderedText(parseGuideInline("See [catalog](/components)"));
    expect(out).toContain("/components");
  });

  test("renders external links as anchors", () => {
    const out = renderedText(
      parseGuideInline("See [docs](https://ui.shadcn.com/docs/cli)"),
    );
    expect(out).toContain("https://ui.shadcn.com/docs/cli");
    expect(out).toContain("_blank");
  });

  test("brackets inside code spans stay untouched", () => {
    const out = renderedText(
      parseGuideInline("Pattern `.../r/[component].json` end"),
    );
    expect(out).toContain("[component]");
    expect(out).not.toContain("_blank");
  });

  test("plain text passes through", () => {
    expect(renderedText(parseGuideInline("Just words"))).toContain(
      "Just words",
    );
  });
});

describe("cli guide claims", () => {
  const cliBlocks = () =>
    getGuidePage("cli").sections.flatMap((section) => section.blocks);

  test("every command block is a shadcn invocation (prefix-safe)", () => {
    const commands = cliBlocks().filter(
      (block): block is Extract<GuideBlock, { kind: "command" }> =>
        block.kind === "command",
    );
    expect(commands.length).toBeGreaterThan(0);
    for (const block of commands) {
      expect(block.command.command.startsWith("shadcn@latest ")).toBe(true);
    }
  });

  test("every referenced component slug exists in the registry", () => {
    const registryNames = new Set(
      registryConfig.items.map((item) => item.name),
    );
    const body = JSON.stringify(getGuidePage("cli").sections);
    const slugs = new Set<string>();
    for (const match of body.matchAll(/@kick-ui\/([a-z0-9-]+)/g)) {
      slugs.add(match[1]);
    }
    for (const match of body.matchAll(/\/r\/([a-z0-9-]+)\.json/g)) {
      slugs.add(match[1]);
    }
    expect(slugs.size).toBeGreaterThan(0);
    for (const slug of slugs) {
      expect(registryNames.has(slug)).toBe(true);
    }
  });

  test("embedded registries snippets match components.json", () => {
    const expected = (componentsConfig as { registries: unknown }).registries;
    const jsonBlocks = cliBlocks().filter(
      (block): block is Extract<GuideBlock, { kind: "snippet" }> =>
        block.kind === "snippet" && block.snippet.mode === "json",
    );
    expect(jsonBlocks.length).toBeGreaterThan(0);
    for (const block of jsonBlocks) {
      expect(JSON.parse(block.snippet.code)).toEqual({
        registries: expected,
      });
    }
  });
});
