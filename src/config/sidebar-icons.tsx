import {
  Blocks,
  ChartLine,
  Download,
  Layers,
  LayoutTemplate,
  MousePointerClick,
  Sparkles,
  Type,
} from "lucide-react";
import XIcon from "@/components/svgs/brand/XIcon";
import type { ComponentCategory } from "@/lib/component-categories";
import type { ComponentType } from "react";

/**
 * Any component that accepts `className` and renders an icon.
 *
 * Deliberately not `LucideIcon`: lucide exports `ForwardRefExoticComponent`,
 * which a plain function component does not structurally satisfy. Both the
 * lucide icons and the hand-rolled `XIcon` brand component fit this type,
 * which is what lets one map hold either source.
 */
type SidebarIcon = ComponentType<{ className?: string }>;

/**
 * Icons for the sidebar section headings.
 *
 * Deliberately a lookup keyed by the *existing* ids and titles rather than a
 * field added to the data itself:
 *  - src/lib/component-categories.ts is loaded by the build scripts through
 *    the frontmatter schema, so it must stay pure data (CI also asserts it is
 *    untouched by `registry:build`),
 *  - src/config/docs.ts declares "pure data, zero imports" because pipeline
 *    scripts and the e2e audit import it directly,
 *  - src/config/Sidebar.tsx is imported by tests/guides.test.ts.
 *
 * A `Record` keyed by `ComponentCategory` means TypeScript fails loudly if a
 * new category is added without an icon — add the entry here in the same
 * change. Static sections are keyed by title and tolerate a miss, because
 * those titles are hand-written prose rather than a closed set.
 */

/** Per-category icon. Total by design: every category must have one. */
export const categoryIcons: Record<ComponentCategory, SidebarIcon> = {
  buttons: MousePointerClick,
  cards: Layers,
  components: Blocks,
  "text-animations": Type,
  "layouts-sections": LayoutTemplate,
  animations: Sparkles,
  charts: ChartLine,
};

/**
 * Per-static-section icon, keyed by `SidebarStaticSection.title`.
 *
 * Mixed sources on purpose: "Follow for Updates" uses the project's own
 * `XIcon` brand component (lucide's `Twitter` is the retired bird glyph),
 * while the guide sections stay on lucide like every other heading.
 */
export const staticSectionIcons: Partial<Record<string, SidebarIcon>> = {
  "Follow for Updates": XIcon,
  Installation: Download,
};
