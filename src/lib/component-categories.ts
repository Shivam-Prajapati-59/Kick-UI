export const componentCategories = [
  { id: "buttons", label: "Buttons", description: "Interactive controls and calls to action." },
  { id: "cards", label: "Cards", description: "Content containers and card-based patterns." },
  { id: "components", label: "Components", description: "Reusable interactive UI building blocks." },
  { id: "text-animations", label: "Text Animations", description: "Animated typography and text effects." },
  { id: "layouts-sections", label: "Layouts & Sections", description: "Complete page sections and layouts." },
  { id: "animations", label: "Animations", description: "Visual and cursor-driven animation effects." },
] as const;

export type ComponentCategory = (typeof componentCategories)[number]["id"];

export function getCategoryMetadata(category: ComponentCategory) {
  return componentCategories.find((item) => item.id === category)!;
}
