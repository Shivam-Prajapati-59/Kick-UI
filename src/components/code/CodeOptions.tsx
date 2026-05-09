"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FileCode2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Variant wrapper components                                         */
/*  Used in MDX like: <CodeOptions><CSS>…</CSS><Tailwind>…</Tailwind></CodeOptions> */
/* ------------------------------------------------------------------ */

interface VariantProps {
  children: ReactNode;
}

export function CSS({ children }: VariantProps) {
  return <>{children}</>;
}
export function Tailwind({ children }: VariantProps) {
  return <>{children}</>;
}
export function TSCSS({ children }: VariantProps) {
  return <>{children}</>;
}
export function TSTailwind({ children }: VariantProps) {
  return <>{children}</>;
}

/* ------------------------------------------------------------------ */
/*  FileLabel — shows the filename with a file icon                    */
/* ------------------------------------------------------------------ */

interface FileLabelProps {
  filename: string;
}

function FileLabel({ filename }: FileLabelProps) {
  return (
    <div
      className={cn(
        "mb-2 inline-flex items-center gap-2 rounded-lg border border-border",
        "bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground"
      )}
    >
      <FileCode2 className="h-3.5 w-3.5 shrink-0" />
      <span className="font-mono">{filename}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CodeOptions component                                              */
/* ------------------------------------------------------------------ */

interface CodeOptionsProps {
  children: ReactNode;
  /** The filename to display (e.g. "components/ui/shinny-button.tsx") */
  filename?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Renders a filename label above the source code block.
 * Previously had language/style selector dropdowns — now simplified
 * to show only the first available variant with its filename.
 *
 * Usage in MDX:
 * ```mdx
 * <CodeOptions filename="components/ui/shinny-button.tsx">
 *   <TSTailwind><CodeHighlighter language="tsx" codeString={tsTwCode} /></TSTailwind>
 * </CodeOptions>
 * ```
 */
export default function CodeOptions({ children, filename, className }: CodeOptionsProps) {
  return (
    <div className={cn("mt-0 w-full", className)}>
      {/* Filename label */}
      {filename && <FileLabel filename={filename} />}

      {/* Content — render all children directly */}
      <div>{children}</div>
    </div>
  );
}
