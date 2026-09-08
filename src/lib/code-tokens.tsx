import { createElement, Fragment, type ReactNode } from "react";

export interface CodeToken {
  /** Regex source (plain string: RegExp instances can't cross the server/client boundary). */
  pattern: string;
  flags?: string;
  className: string;
}

function toRegExp(rule: CodeToken): RegExp {
  const flags = rule.flags?.includes("g") ? rule.flags : `${rule.flags ?? ""}g`;
  return new RegExp(rule.pattern, flags);
}

/**
 * Splits text into plain strings and highlighted spans. Rules apply in
 * order, so earlier rules win on overlap. Pure and SSR-safe.
 */
export function tokenizeText(
  text: string,
  rules: CodeToken[],
  keyPrefix: string,
): ReactNode[] {
  let parts: ReactNode[] = [text];
  rules.forEach((rule, ruleIndex) => {
    const pattern = toRegExp(rule);
    const next: ReactNode[] = [];
    parts.forEach((part, partIndex) => {
      if (typeof part !== "string") {
        next.push(part);
        return;
      }
      pattern.lastIndex = 0;
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      let matchIndex = 0;
      while ((match = pattern.exec(part)) !== null) {
        if (match.index > lastIndex) {
          next.push(part.slice(lastIndex, match.index));
        }
        if (match[0].length > 0) {
          next.push(
            createElement(
              "span",
              {
                key: `${keyPrefix}-${ruleIndex}-${partIndex}-${matchIndex}`,
                className: rule.className,
              },
              match[0],
            ),
          );
        }
        matchIndex += 1;
        lastIndex = match.index + match[0].length;
        if (match[0].length === 0) pattern.lastIndex += 1;
      }
      if (lastIndex < part.length) next.push(part.slice(lastIndex));
    });
    parts = next;
  });
  return parts;
}

/** Shared terminal palette for guide snippets (commands + Q&A transcripts). */
export const terminalTokens: CodeToken[] = [
  {
    pattern: "\\bnpx\\b|\\bnpm\\b|\\bpnpm\\b|\\byarn\\b|\\bbun\\b|\\bcd\\b",
    className: "font-semibold text-emerald-600 dark:text-emerald-400",
  },
  {
    pattern: "\\bWould\\b|\\bWhat\\b|\\bWhich\\b",
    className: "text-amber-600 dark:text-amber-300",
  },
  {
    pattern: "@/\\*|src/|my-app|AGENTS\\.md|CLAUDE\\.md",
    className: "text-sky-600 dark:text-sky-300",
  },
  {
    pattern: "\\?",
    className: "font-semibold text-amber-600 dark:text-amber-300",
  },
];

/** Line-preserving render for tokenized terminal text. */
export function TokenizedLines({
  text,
  tokens,
}: {
  text: string;
  tokens: CodeToken[];
}): ReactNode {
  return (
    <>
      {text.split("\n").map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && "\n"}
          {tokenizeText(line, tokens, `l${lineIndex}`)}
        </Fragment>
      ))}
    </>
  );
}
