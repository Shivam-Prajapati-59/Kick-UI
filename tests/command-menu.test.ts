import { describe, expect, test } from "bun:test";
import {
  buildCommandEntries,
  filterCommandEntries,
} from "../src/components/command/CommandMenu";

describe("buildCommandEntries", () => {
  test("covers pages, every registry component, guides, and actions", () => {
    const entries = buildCommandEntries();
    const ids = entries.map((entry) => entry.id);
    expect(ids).toContain("home");
    expect(ids).toContain("components");
    expect(ids).toContain("component:shiny-button");
    expect(ids).toContain("guide:cli");
    expect(ids).toContain("action:toggle-theme");
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("navigation entries carry hrefs", () => {
    const entries = buildCommandEntries();
    for (const entry of entries) {
      if (entry.action) continue;
      expect(typeof entry.href).toBe("string");
    }
  });
});

describe("filterCommandEntries", () => {
  const entries = buildCommandEntries();

  test("empty query returns everything", () => {
    expect(filterCommandEntries(entries, "  ")).toEqual(entries);
  });

  test("matches case-insensitively across label, hint, and id", () => {
    expect(
      filterCommandEntries(entries, "SHINY").map((entry) => entry.id),
    ).toContain("component:shiny-button");
    expect(filterCommandEntries(entries, "guide").length).toBeGreaterThan(0);
  });

  test("no match returns an empty list", () => {
    expect(filterCommandEntries(entries, "zzz-no-such-thing")).toEqual([]);
  });
});
