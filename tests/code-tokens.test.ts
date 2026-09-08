import { describe, expect, test } from "bun:test";
import {
  terminalTokens,
  tokenizeText,
  type CodeToken,
} from "../src/lib/code-tokens";

function texts(nodes: unknown): string[] {
  const out: string[] = [];
  const walk = (node: unknown): void => {
    if (typeof node === "string") out.push(node);
    else if (Array.isArray(node)) node.forEach(walk);
    else if (
      node !== null &&
      typeof node === "object" &&
      "props" in node &&
      (node as { props?: unknown }).props !== null &&
      typeof (node as { props: unknown }).props === "object"
    ) {
      walk((node as { props: { children?: unknown } }).props.children);
    }
  };
  walk(nodes);
  return out;
}

describe("tokenizeText", () => {
  const rules: CodeToken[] = [
    { pattern: "\\bnpx\\b", className: "cmd" },
    { pattern: "my-app", className: "path" },
  ];

  test("highlights matches and preserves surrounding text", () => {
    const parts = tokenizeText("npx create my-app", rules, "t");
    expect(texts(parts).join("")).toBe("npx create my-app");
  });

  test("earlier rules win on overlap", () => {
    const parts = tokenizeText(
      "npx",
      [
        { pattern: "npx", className: "first" },
        { pattern: "npx", className: "second" },
      ],
      "t",
    );
    expect(JSON.stringify(parts)).toContain("first");
    expect(JSON.stringify(parts)).not.toContain("second");
  });

  test("plain text passes through untouched", () => {
    expect(tokenizeText("hello world", rules, "t")).toEqual(["hello world"]);
  });
});

describe("terminalTokens", () => {
  test("covers commands, questions, paths and prompt markers", () => {
    const joined = texts(
      tokenizeText("Would npx foo src/ @/* my-app?", terminalTokens, "t"),
    ).join("");
    expect(joined).toBe("Would npx foo src/ @/* my-app?");
  });
});
