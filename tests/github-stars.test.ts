import { describe, expect, test } from "bun:test";
import { formatStarCount } from "../src/lib/github-stars";
import { SITE_CONFIG } from "../src/lib/site-config";

describe("formatStarCount", () => {
  test("small counts render verbatim", () => {
    expect(formatStarCount(0)).toBe("0");
    expect(formatStarCount(7)).toBe("7");
    expect(formatStarCount(999)).toBe("999");
  });

  test("thousands use one decimal below 10k", () => {
    expect(formatStarCount(1000)).toBe("1k");
    expect(formatStarCount(1234)).toBe("1.2k");
    expect(formatStarCount(9949)).toBe("9.9k");
  });

  test("10k and above drop the decimal to stay narrow", () => {
    expect(formatStarCount(10000)).toBe("10k");
    expect(formatStarCount(12345)).toBe("12k");
    expect(formatStarCount(999999)).toBe("1000k");
  });
});

describe("repo slug derivation", () => {
  test("SITE_CONFIG.github yields a slug the API can resolve", () => {
    // The fetch derives owner/repo from this same URL, so a malformed or
    // non-github value would silently hide the badge forever.
    const match = SITE_CONFIG.github.match(
      /^https?:\/\/github\.com\/([^/]+\/[^/]+)/,
    );
    expect(match).not.toBeNull();
    expect(match![1]).toBe("Shivam-Prajapati-59/Kick-UI");
  });
});
