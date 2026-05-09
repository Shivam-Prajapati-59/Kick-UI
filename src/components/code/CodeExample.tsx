"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import CliInstallation from "./ClIInstallation";
import CodeHighlighter from "./CodeHighlighter";
import CodeDependencies from "./CodeDependecies";
import CodeOptions, { CSS, Tailwind, TSCSS, TSTailwind } from "./CodeOptions";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CodeVariants {
  /** JavaScript + Plain CSS source */
  code?: string;
  /** JavaScript + Tailwind source */
  tailwind?: string;
  /** TypeScript + Plain CSS source */
  tsCode?: string;
  /** TypeScript + Tailwind source */
  tsTailwind?: string;
  /** Optional CSS file content */
  css?: string;
}

interface CodeExampleProps {
  /** Component slug from the registry (e.g. "shinny-button") */
  slug: string;
  /** Usage example code string */
  usage?: string;
  /** Source code variants */
  variants?: CodeVariants;
  /** Dependencies list (if not provided, read from registry) */
  dependencies?: string[];
  /** The filename to display above source code (e.g. "components/ui/shinny-button.tsx") */
  sourceFilename?: string;
  /** Additional children to render after the code sections */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Orchestrator component that renders a full code documentation section:
 * 1. CLI / Manual install commands
 * 2. Usage example
 * 3. Source code with filename label
 * 4. CSS file (if present)
 * 5. Dependencies list
 *
 * Usage in MDX:
 * ```mdx
 * <CodeExample
 *   slug="shinny-button"
 *   usage={`import { ShinyButton } from "@/components/shinny-button";
 *
 * <ShinyButton>Click me</ShinyButton>`}
 *   variants={{
 *     tsTailwind: `"use client"; ... full source code ...`,
 *   }}
 *   sourceFilename="components/ui/shinny-button.tsx"
 * />
 * ```
 */
export default function CodeExample({
  slug,
  usage,
  variants,
  dependencies,
  sourceFilename,
  children,
  className,
}: CodeExampleProps) {
  /* Pick the best available source code — prioritize TS+Tailwind */
  const sourceCode =
    variants?.tsTailwind ||
    variants?.tsCode ||
    variants?.tailwind ||
    variants?.code ||
    "";

  const sourceLanguage =
    variants?.tsTailwind || variants?.tsCode ? "tsx" : "jsx";

  const hasSource = !!sourceCode;

  /* Derive filename from slug if not explicitly provided */
  const filename = sourceFilename || (slug ? `components/ui/${slug}.tsx` : undefined);

  return (
    <div className={cn("space-y-6", className)}>
      {/* 1. Install commands */}
      <CliInstallation slug={slug} />

      {/* 2. Usage example */}
      {usage && (
        <div>
          <h3 className="mb-3 text-base font-semibold tracking-tight">
            Usage
          </h3>
          <CodeHighlighter
            language="tsx"
            codeString={usage}
            showLineNumbers={false}
            snippetId={`${slug}-usage`}
          />
        </div>
      )}

      {/* 3. Source code with filename label */}
      {hasSource && (
        <div>
          <h3 className="mb-3 text-base font-semibold tracking-tight">
            Source Code
          </h3>
          <CodeOptions filename={filename}>
            <CodeHighlighter
              language={sourceLanguage}
              codeString={sourceCode}
              snippetId={`${slug}-source`}
            />
          </CodeOptions>

          {/* CSS file (if present) */}
          {variants?.css && (
            <div className="mt-4">
              <CodeOptions filename={`${slug}.css`}>
                <CodeHighlighter
                  language="css"
                  codeString={variants.css}
                  snippetId={`${slug}-css-file`}
                />
              </CodeOptions>
            </div>
          )}
        </div>
      )}

      {/* 4. Dependencies */}
      {dependencies && dependencies.length > 0 && (
        <CodeDependencies dependencies={dependencies} />
      )}

      {/* 5. Extra children (e.g. props table injected from MDX) */}
      {children}
    </div>
  );
}

/* Re-export sub-components for granular MDX usage */
export { CliInstallation, CodeHighlighter, CodeDependencies, CodeOptions };
export { CSS, Tailwind, TSCSS, TSTailwind };
