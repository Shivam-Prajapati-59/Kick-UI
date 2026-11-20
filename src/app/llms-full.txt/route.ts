import { componentCategories } from "@/lib/component-categories";
import { guideHref, guideSections } from "@/config/docs";
import { componentIndex } from "@/generated/component-index";
import { getComponentDoc } from "@/lib/component-docs";
import {
  EXAMPLE_COMPONENT_NAME,
  EXAMPLE_INSTALL_COMMAND,
  generateInstallCommands,
  REGISTRY_HOMEPAGE,
} from "@/lib/cli-commands";
import { SITE_CONFIG } from "@/lib/site-config";

export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [];

  lines.push("# Kick UI");
  lines.push("");
  lines.push(
    `> ${SITE_CONFIG.description} Components use Tailwind CSS and Motion and can be installed as source code through the shadcn CLI.`,
  );
  lines.push("");
  lines.push("## How to install with the shadcn CLI / MCP");
  lines.push("");
  lines.push(`- Registry index: ${SITE_CONFIG.url}/r/registry.json`);
  lines.push("- MCP: `npx shadcn@latest mcp init`");
  lines.push(`- Add a component: \`${EXAMPLE_INSTALL_COMMAND}\``);
  lines.push(
    `- components.json registry mapping: \`{ "registries": { "@kick-ui": "${REGISTRY_HOMEPAGE}/r/{name}.json" } }\``,
  );
  lines.push(
    `- Add a component by namespace: \`npx shadcn@latest add @kick-ui/${EXAMPLE_COMPONENT_NAME}\``,
  );
  lines.push("");
  lines.push("## Guides");
  lines.push("");
  for (const section of guideSections) {
    for (const page of section.pages) {
      lines.push(`### ${page.title}`);
      lines.push("");
      lines.push(`- URL: ${SITE_CONFIG.url}${guideHref(page.slug)}`);
      lines.push(`- Description: ${page.description}`);
      lines.push("");
    }
  }

  lines.push("## Components");
  lines.push("");
  for (const category of componentCategories) {
    const items = componentIndex.filter(
      (item) => item.category === category.id,
    );
    if (items.length === 0) continue;
    lines.push(`### ${category.label}`);
    lines.push("");
    for (const item of items) {
      const doc = getComponentDoc(item.slug);
      if (!doc) continue;
      lines.push(`#### ${doc.title}`);
      lines.push("");
      lines.push(`- URL: ${SITE_CONFIG.url}/components/${item.slug}`);
      lines.push(`- Description: ${doc.description}`);
      const commands = generateInstallCommands({
        registryUrl:
          doc.registryUrl ?? `${SITE_CONFIG.url}/r/${item.slug}.json`,
        dependencies: doc.dependencies,
      });
      lines.push(`- Install: \`${commands.shadcn.npm}\``);
      lines.push(`- Dependencies: ${doc.dependencies.join(", ") || "none"}`);
      lines.push("");
      if (doc.usage.trim().length > 0) {
        lines.push("- Usage:");
        lines.push("");
        lines.push("```tsx");
        lines.push(doc.usage.trim());
        lines.push("```");
        lines.push("");
      }
    }
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
