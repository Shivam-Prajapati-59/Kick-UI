/**
 * Canonical category list. Single source of truth, read by:
 * - scripts/component-doc-schema.mjs (build-time frontmatter validation)
 * - scripts/build-docs.mjs (generates src/lib/component-categories.ts)
 *
 * Add a category here, then run `bun docs:build`. Nothing else to touch.
 */
export const categories = [
  { id: "buttons", label: "Buttons", description: "Interactive controls and calls to action." },
  { id: "cards", label: "Cards", description: "Content containers and card-based patterns." },
  { id: "components", label: "Components", description: "Reusable interactive UI building blocks." },
  { id: "text-animations", label: "Text Animations", description: "Animated typography and text effects." },
  { id: "layouts-sections", label: "Layouts & Sections", description: "Complete page sections and layouts." },
  { id: "animations", label: "Animations", description: "Visual and cursor-driven animation effects." },
];

export const categoryIds = categories.map((category) => category.id);
