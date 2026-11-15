import { componentCategories } from "@/lib/component-categories";
import { guideHref, guideSections } from "@/config/docs";
import { componentIndex } from "@/generated/component-index";
import { SITE_CONFIG } from "@/lib/site-config";

export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [];

  lines.push("# Kick UI");
  lines.push("");
  lines.push(
    "> Kick UI is an open-source collection of animated React and Web3 UI components. Components use Tailwind CSS and Motion and can be installed as source code through the shadcn CLI.",
  );
  lines.push("");
  lines.push("## Start here");
  lines.push("");
  lines.push(
    `- [Component catalog](${SITE_CONFIG.url}/components): Browse components and live previews.`,
  );
  for (const section of guideSections) {
    for (const page of section.pages) {
      lines.push(
        `- [${page.title}](${SITE_CONFIG.url}${guideHref(page.slug)}): ${page.description}`,
      );
    }
  }
  lines.push("");
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
      lines.push(
        `- [${item.title}](${SITE_CONFIG.url}/components/${item.slug}): ${item.description}`,
      );
    }
    lines.push("");
  }
  lines.push("## Source and registry");
  lines.push("");
  lines.push(
    `- [GitHub repository](${SITE_CONFIG.github}): Source code, license, and contribution details.`,
  );
  lines.push(
    `- [Registry index](${SITE_CONFIG.url}/r/registry.json): Available registry items.`,
  );

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}