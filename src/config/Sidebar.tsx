import { componentIndex } from "@/generated/component-index";
import {
  componentCategories,
  type ComponentCategory,
} from "@/lib/component-categories";
import { SITE_CONFIG } from "@/lib/site-config";

export interface SidebarItem {
  label: string;
  slug: string;
}

export interface SidebarCategory {
  category: ComponentCategory;
  title: string;
  basePath: "/components";
  items: SidebarItem[];
}

export const sidebarCategories: SidebarCategory[] = componentCategories.map(
  (category) => ({
    category: category.id,
    title: category.label,
    basePath: "/components",
    items: componentIndex
      .filter((component) => component.category === category.id)
      .map((component) => ({ label: component.title, slug: component.slug })),
  }),
);

export function getActiveCategories() {
  return sidebarCategories.filter((category) => category.items.length > 0);
}

export interface SidebarStaticItem {
  label: string;
  href: string;
}

export interface SidebarStaticSection {
  title: string;
  items: SidebarStaticItem[];
}

/**
 * Hand-written sections for non-component pages (personal links, setup
 * guides). Rendered above the generated component categories wherever the
 * sidebar appears. Content for these pages lands later; entries exist so
 * the information architecture is reviewable now.
 */
export const sidebarStaticSections: SidebarStaticSection[] = [
  {
    title: "Follow for Updates",
    items: [{ label: "Twitter @Shivamp69_", href: SITE_CONFIG.twitter }],
  },
  {
    title: "Installation",
    items: [
      { label: "Install Next.js", href: "/docs/nextjs" },
      { label: "Install Tailwind CSS", href: "/docs/tailwind-css" },
      { label: "Add Utilities", href: "/docs/utilities" },
      { label: "CLI", href: "/docs/cli" },
    ],
  },
];
