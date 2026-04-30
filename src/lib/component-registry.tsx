import React from "react";
import { ShinyButton } from "@/components/demo/Components/ShinnyButton";

export interface PropItem {
  name: string;
  type: string;
  default?: string;
  description?: string;
}

export interface ComponentRegistryItem {
  name: string;
  slug: string;
  description: string;
  category: string;
  dependencies: string[];
  registryDependencies: string[];
  installCommand: string;
  usage: string;
  preview: React.ReactNode;
  propsData: PropItem[];
}

export const componentRegistry: ComponentRegistryItem[] = [
  {
    name: "Shiny Button",
    slug: "shinny-button",
    description: "A button with a smooth shiny animation effect.",
    category: "Buttons",
    dependencies: ["motion"],
    registryDependencies: ["button"],
    installCommand: "npx shadcn@latest add https://kick-ui.vercel.app/registry/new-york/components/shinny-button.json",
    usage: `import { ShinyButton } from "@/components/demo/Components/ShinnyButton";

export default function Example() {
  return <ShinyButton>Shinny Button</ShinyButton>;
}`,
    preview: <ShinyButton>Shinny Button</ShinyButton>,
    propsData: [
      {
        name: "shimmerWidth",
        type: "number",
        default: "-",
        description: "Width of the shimmer effect.",
      },
      {
        name: "duration",
        type: "number",
        default: "2",
        description: "Duration of one animation cycle in seconds.",
      },
      {
        name: "className",
        type: "string",
        default: "''",
        description: "Adds custom classes to the root element.",
      },
    ]
  },
];

export function getComponent(slug: string) {
  return componentRegistry.find((c) => c.slug === slug);
}

export function getAllComponents() {
  return componentRegistry;
}

export function getComponentsByCategory() {
  const grouped: Record<string, ComponentRegistryItem[]> = {};
  for (const component of componentRegistry) {
    if (!grouped[component.category]) {
      grouped[component.category] = [];
    }
    grouped[component.category].push(component);
  }
  return grouped;
}
