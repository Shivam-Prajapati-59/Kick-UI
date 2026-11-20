// Declared once by hand. The frontmatter schema and the sidebar derive from it.
export const componentCategories = [
  {
    id: "web3-widgets",
    label: "Web3 Widgets",
    description: "Wallet, trading and onchain flow components.",
  },
  {
    id: "carousels",
    label: "Carousels",
    description: "Coverflow, stacked and drifting carousels.",
  },
  {
    id: "cards",
    label: "Cards",
    description: "Content containers and card-based patterns.",
  },
  {
    id: "buttons",
    label: "Buttons",
    description: "Interactive controls and calls to action.",
  },
  {
    id: "text-animations",
    label: "Text Animations",
    description: "Animated typography and text effects.",
  },
  {
    id: "backgrounds-effects",
    label: "Backgrounds & Effects",
    description: "Backgrounds, cursor effects and visual treatments.",
  },
  {
    id: "navigation-lists",
    label: "Navigation & Lists",
    description: "Docks, menus and animated lists.",
  },
  {
    id: "sections",
    label: "Sections",
    description: "Complete page sections and layouts.",
  },
] as const;

export type ComponentCategory = (typeof componentCategories)[number]["id"];

export function getCategoryMetadata(category: ComponentCategory) {
  return componentCategories.find((item) => item.id === category)!;
}
