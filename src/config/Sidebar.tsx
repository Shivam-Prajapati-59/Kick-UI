import { componentIndex } from "@/generated/component-index";
import { componentCategories, type ComponentCategory } from "@/lib/component-categories";

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
