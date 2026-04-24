"use client";

import { Children, type ReactNode, type ReactElement } from "react";
import { cn } from "@/lib/utils";
import { useCodeOptions, type Language, type StylePreset } from "@/hooks/useCodeOptions";

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
/*  Selector button                                                    */
/* ------------------------------------------------------------------ */

interface SelectorButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}

function SelectorButton({ label, active, onClick, color }: SelectorButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
        active
          ? "bg-foreground/10 text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {color && (
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Color + label maps                                                 */
/* ------------------------------------------------------------------ */

const LANG_CONFIG: Record<Language, { label: string; color: string }> = {
  JS: { label: "JavaScript", color: "#F7DF1E" },
  TS: { label: "TypeScript", color: "#3178C6" },
};

const STYLE_CONFIG: Record<StylePreset, { label: string; color: string }> = {
  CSS: { label: "CSS", color: "#B497CF" },
  TW: { label: "Tailwind", color: "#38BDF8" },
};

/* ------------------------------------------------------------------ */
/*  CodeOptions component                                              */
/* ------------------------------------------------------------------ */

interface CodeOptionsProps {
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Renders a language × style selector, and displays the matching
 * variant child (CSS, Tailwind, TSCSS, TSTailwind).
 *
 * Usage in MDX:
 * ```mdx
 * <CodeOptions>
 *   <CSS><CodeHighlighter language="jsx" codeString={jsCode} /></CSS>
 *   <Tailwind><CodeHighlighter language="jsx" codeString={twCode} /></Tailwind>
 *   <TSCSS><CodeHighlighter language="tsx" codeString={tsCode} /></TSCSS>
 *   <TSTailwind><CodeHighlighter language="tsx" codeString={tsTwCode} /></TSTailwind>
 * </CodeOptions>
 * ```
 */
export default function CodeOptions({ children, className }: CodeOptionsProps) {
  const { language, setLanguage, style, setStyle } = useCodeOptions();

  /* ---- bucket children by variant type ---- */
  const buckets = {
    JS: { css: null as ReactNode, tailwind: null as ReactNode },
    TS: { css: null as ReactNode, tailwind: null as ReactNode },
  };

  Children.forEach(children, (child) => {
    if (!child || typeof child !== "object") return;
    const el = child as ReactElement<VariantProps>;
    if (el.type === CSS) buckets.JS.css = el;
    if (el.type === Tailwind) buckets.JS.tailwind = el;
    if (el.type === TSCSS) buckets.TS.css = el;
    if (el.type === TSTailwind) buckets.TS.tailwind = el;
  });

  /* ---- resolve which variant to show ---- */
  const styleKey = style === "TW" ? "tailwind" : "css";
  const activeNode = buckets[language][styleKey];

  const unsupported = (
    <div className="my-4 flex items-center gap-2 text-sm text-muted-foreground">
      <span>This combination is not available yet.</span>
    </div>
  );

  return (
    <div className={cn("mt-0 w-full", className)}>
      {/* Selectors */}
      <div className="mb-2 flex items-center gap-2">
        {/* Language selector */}
        <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
          {(Object.keys(LANG_CONFIG) as Language[]).map((lang) => (
            <SelectorButton
              key={lang}
              label={LANG_CONFIG[lang].label}
              color={LANG_CONFIG[lang].color}
              active={language === lang}
              onClick={() => setLanguage(lang)}
            />
          ))}
        </div>

        {/* Style selector */}
        <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
          {(Object.keys(STYLE_CONFIG) as StylePreset[]).map((s) => (
            <SelectorButton
              key={s}
              label={STYLE_CONFIG[s].label}
              color={STYLE_CONFIG[s].color}
              active={style === s}
              onClick={() => setStyle(s)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div>{activeNode ?? unsupported}</div>
    </div>
  );
}
