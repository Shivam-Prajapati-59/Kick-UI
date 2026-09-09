import { componentIndex } from "@/generated/component-index";
import { guideHref, guideSections } from "./docs";
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
 * guides). Guide entries derive from src/config/docs.ts — the Resources
 * entry is a plain external link with no page behind it. Rendered above
 * the generated component categories wherever the sidebar appears.
 */
export const sidebarStaticSections: SidebarStaticSection[] = [
  {
    title: "Follow for Updates",
    items: [
      {
        label: `Twitter ${SITE_CONFIG.twitterHandle}`,
        href: SITE_CONFIG.twitter,
      },
    ],
  },
  ...guideSections.map((section) => ({
    title: section.title,
    items: section.pages.map((page) => ({
      label: page.title,
      href: guideHref(page.slug),
    })),
  })),
];
