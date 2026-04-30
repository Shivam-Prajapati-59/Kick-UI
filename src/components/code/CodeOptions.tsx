"use client";

import { Children, useState, type ReactNode, type ReactElement } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCodeOptions, type Language, type StylePreset } from "@/hooks/useCodeOptions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TypeScript from "@/components/svgs/languages/TypeScript";
import JavaScript from "@/components/svgs/languages/JavaScript";
import TailwindCss from "@/components/svgs/libraries/TailwindCss";
import CssIcon from "@/components/svgs/languages/Css";

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
/*  SelectorDropdown with SVG icons + chevron animation                */
/* ------------------------------------------------------------------ */

interface SelectorDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; icon?: ReactNode }>;
}

function SelectorDropdown({ label, value, onChange, options }: SelectorDropdownProps) {
  const [open, setOpen] = useState(false);
  const activeOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-w-28 items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          )}
        >
          <span className="flex items-center gap-2">
            {activeOption.icon}
            <span>{activeOption.label}</span>
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 ease-out",
              open && "rotate-180"
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.icon}
              <span>{option.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon + label maps                                                  */
/* ------------------------------------------------------------------ */

const LANG_CONFIG: Record<Language, { label: string; icon: ReactNode }> = {
  JS: { label: "JavaScript", icon: <JavaScript className="w-4.5! h-4.5!" /> },
  TS: { label: "TypeScript", icon: <TypeScript className="w-4.5! h-4.5!" /> },
};

const STYLE_CONFIG: Record<StylePreset, { label: string; icon: ReactNode }> = {
  CSS: { label: "CSS", icon: <CssIcon className="w-4.5! h-4.5!" /> },
  TW: { label: "Tailwind", icon: <TailwindCss className="w-4.5! h-4.5!" /> },
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
            icon: LANG_CONFIG[lang].icon,
          }))}
        />

        <SelectorDropdown
          label="Style"
          value={style}
          onChange={(next) => setStyle(next as StylePreset)}
          options={(Object.keys(STYLE_CONFIG) as StylePreset[]).map((preset) => ({
            value: preset,
            label: STYLE_CONFIG[preset].label,
            icon: STYLE_CONFIG[preset].icon,
          }))}
        />
      </div>

      {/* Content */}
      <div>{activeNode ?? unsupported}</div>
    </div>
  );
}
