import { Link } from "next-view-transitions";
import type { ReactNode } from "react";
import CodeBlock from "./CodeBlock";
import { FileLabel } from "../code/CodeOptions";
import CommandTabs from "../code/CommandTabs";
import { CodeOptionsProvider } from "@/hooks/useCodeOptions";
import { terminalTokens } from "@/lib/code-tokens";
import {
  getGuidePage,
  type GuideBlock,
  type GuideContentSection,
} from "@/config/docs";

const INLINE_PATTERN = /(`[^`]+`)|\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Minimal inline markup for guide prose: `code` spans and [label](href)
 * links (internal hrefs render as client-side Links). Code spans win on
 * overlap, so literal brackets inside backticks stay untouched.
 */
export function parseGuideInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const [full, code, label, href] = match;
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));
    if (code !== undefined) {
      parts.push(<code key={key}>{code.slice(1, -1)}</code>);
    } else if (label !== undefined && href !== undefined) {
      const internal = href.startsWith("/");
      parts.push(
        internal ? (
          <Link
            key={key}
            href={href}
            className="text-primary font-medium hover:underline"
          >
            {label}
          </Link>
        ) : (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-primary font-medium hover:underline"
          >
            {label}
          </a>
        ),
      );
    }
    key += 1;
    lastIndex = index + full.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function GuideBlockView({ block }: { block: GuideBlock }) {
  switch (block.kind) {
    case "paragraph":
      return (
        <p className="text-muted-foreground">{parseGuideInline(block.text)}</p>
      );
    case "snippet": {
      const code =
        block.snippet.mode === "terminal" ? (
          <CodeBlock tokens={terminalTokens}>{block.snippet.code}</CodeBlock>
        ) : block.snippet.mode === "text" ? (
          <CodeBlock>{block.snippet.code}</CodeBlock>
        ) : (
          <CodeBlock language={block.snippet.mode}>
            {block.snippet.code}
          </CodeBlock>
        );
      // Label and code stay paired in one tight unit so section rhythm
      // never wedges them apart.
      return (
        <div className="space-y-2">
          {block.snippet.filename && (
            <FileLabel filename={block.snippet.filename} />
          )}
          {code}
        </div>
      );
    }
    case "command":
      return (
        <CommandTabs
          command={block.command.command}
          snippetId={block.command.snippetId}
        />
      );
  }
}

function GuideContentSectionView({
  section,
}: {
  section: GuideContentSection;
}) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">
        {section.heading}
      </h2>
      {section.blocks.map((block, index) => (
        <GuideBlockView key={index} block={block} />
      ))}
    </section>
  );
}

/**
 * Full guide page: component-page shell (full column width for prose,
 * snippets and commands alike), header from config, sections rendered
 * uniformly. Every guide page file is metadata plus this component.
 */
export default function GuidePage({ slug }: { slug: string }) {
  const page = getGuidePage(slug);
  return (
    <CodeOptionsProvider>
      <article className="w-full space-y-8 py-4">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{page.title}</h1>
          {page.tagline && (
            <p className="text-muted-foreground text-lg">{page.tagline}</p>
          )}
        </header>
        {page.sections.map((section, index) => (
          <GuideContentSectionView key={index} section={section} />
        ))}
      </article>
    </CodeOptionsProvider>
  );
}
