// Registry of all Kick-UI components for documentation
// Add new components here as they are created

export interface ComponentRegistryItem {
  name: string;
  slug: string;
  description: string;
  category: string;
  dependencies: string[];
  registryDependencies: string[];
  installCommand: string;
}

export const componentRegistry: ComponentRegistryItem[] = [
  {
    name: "Shinny Button",
    slug: "shinny-button",
    description: "A button with a smooth shiny animation effect.",
    category: "Buttons",
    dependencies: ["motion"],
    registryDependencies: ["button"],
    installCommand: "npx shadcn@latest add https://kick-ui.vercel.app/registry/new-york/components/shinny-button.json",
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
