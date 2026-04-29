"use client";

import { Children, type ReactNode, type ReactElement } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCodeOptions, type Language, type StylePreset } from "@/hooks/useCodeOptions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface SelectorDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; color?: string }>;
}

function SelectorDropdown({ label, value, onChange, options }: SelectorDropdownProps) {
  const activeOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-w-28 items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          )}
        >
          <span className="flex items-center gap-2">
            {activeOption.color && (
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: activeOption.color }}
              />
            )}
            <span>{activeOption.label}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.color && (
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
              )}
              <span>{option.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <SelectorDropdown
          label="Language"
          value={language}
          onChange={(next) => setLanguage(next as Language)}
          options={(Object.keys(LANG_CONFIG) as Language[]).map((lang) => ({
            value: lang,
            label: LANG_CONFIG[lang].label,
            color: LANG_CONFIG[lang].color,
          }))}
        />

        <SelectorDropdown
          label="Style"
          value={style}
          onChange={(next) => setStyle(next as StylePreset)}
          options={(Object.keys(STYLE_CONFIG) as StylePreset[]).map((preset) => ({
            value: preset,
            label: STYLE_CONFIG[preset].label,
            color: STYLE_CONFIG[preset].color,
          }))}
        />
      </div>

      {/* Content */}
      <div>{activeNode ?? unsupported}</div>
    </div>
  );
}
