import {
  getAllComponentDocs,
  getComponentDoc,
  type ComponentDoc,
} from "@/lib/component-docs";
import { SITE_CONFIG } from "@/lib/site-config";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllComponentDocs().map((component) => ({ slug: component.slug }));
}

function buildComponentMarkdown(component: ComponentDoc) {
  const lines: string[] = [];

  lines.push(`# ${component.title}`);
  lines.push("");
  if (component.description) {
    lines.push(component.description);
    lines.push("");
  }
  lines.push(`**Category:** ${component.category}`);
  lines.push("");

  lines.push("## Install");
  lines.push("");
  lines.push("```bash");
  lines.push(`npx shadcn@latest add ${SITE_CONFIG.url}/r/${component.slug}.json`);
  lines.push("```");
  lines.push("");

  if (component.dependencies && component.dependencies.length > 0) {
    lines.push("## Dependencies");
    lines.push("");
    for (const dependency of component.dependencies) {
      lines.push(`- ${dependency}`);
    }
    lines.push("");
  }

  if (component.props && component.props.length > 0) {
    lines.push("## Props");
    lines.push("");
    lines.push("| Name | Type | Default | Description |");
    lines.push("| --- | --- | --- | --- |");
    for (const prop of component.props) {
      const type = String(prop.type).replace(/\|/g, "\\|");
      const defaultValue = prop.default
        ? String(prop.default).replace(/\|/g, "\\|")
        : "";
      const description = prop.description
        ? String(prop.description).replace(/\|/g, "\\|")
        : "";
      lines.push(
        `| ${prop.name} | ${type} | ${defaultValue} | ${description} |`,
      );
    }
    lines.push("");
  }

  if (component.usage && component.usage.trim().length > 0) {
    lines.push("## Usage");
    lines.push("");
    lines.push("```tsx");
    lines.push(component.usage.trim());
    lines.push("```");
    lines.push("");
  }

  if (component.body && component.body.trim().length > 0) {
    lines.push("## Documentation");
    lines.push("");
    lines.push(component.body.trim());
    lines.push("");
  }

  return lines.join("\n");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const component = getComponentDoc(slug);
  if (!component) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const markdown = buildComponentMarkdown(component);

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
