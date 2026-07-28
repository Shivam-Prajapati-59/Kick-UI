import { getCategoryMetadata, type ComponentCategory } from "@/lib/component-categories";

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

const itemsByCategory: Record<ComponentCategory, SidebarItem[]> = {
  buttons: [
    { label: "Shiny Button", slug: "shiny-button" },
    { label: "Slide Text Button", slug: "slide-text-button" },
  ],
  cards: [
    { label: "Card Stack", slug: "card-stack" },
    { label: "Pill Card", slug: "pill-card" },
  ],
  components: [
    { label: "Perspective Grid", slug: "perspective-grid" },
    { label: "MagDock", slug: "mag-dock" },
    { label: "Pixel Image", slug: "pixel-image" },
    { label: "Animated List", slug: "animated-list" },
  ],
  "text-animations": [
    { label: "Scramble Text", slug: "scramble-text" },
    { label: "Text Focus", slug: "text-focus" },
  ],
  "layouts-sections": [
    { label: "Feature Showcase", slug: "feature-showcase" },
    { label: "Scroll Card", slug: "scroll-card" },
  ],
  animations: [{ label: "Cursor WebFluid", slug: "cursor-web-fluid" }],
};

export const sidebarCategories: SidebarCategory[] = (
  Object.keys(itemsByCategory) as ComponentCategory[]
).map((category) => ({
  category,
  title: getCategoryMetadata(category).label,
  basePath: "/components",
  items: itemsByCategory[category],
}));

export function getActiveCategories() {
  return sidebarCategories.filter((category) => category.items.length > 0);
}
