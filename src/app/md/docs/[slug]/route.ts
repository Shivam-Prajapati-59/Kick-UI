import {
  getGuidePage,
  guideSections,
  type GuideBlock,
  type GuidePage,
} from "@/config/docs";

export const dynamic = "force-static";

export function generateStaticParams() {
  return guideSections
    .flatMap((section) => section.pages)
    .map((page) => ({ slug: page.slug }));
}

function languageForMode(mode: string): string {
  switch (mode) {
    case "terminal":
      return "bash";
    case "javascript":
      return "javascript";
    case "json":
      return "json";
    case "css":
      return "css";
    case "tsx":
      return "tsx";
    default:
      return "text";
  }
}

function renderBlock(block: GuideBlock): string {
  switch (block.kind) {
    case "paragraph":
      return block.text;
    case "snippet": {
      const parts: string[] = [];
      if (block.snippet.filename) {
        parts.push(`**${block.snippet.filename}**`);
        parts.push("");
      }
      parts.push(`\`\`\`${languageForMode(block.snippet.mode)}`);
      parts.push(block.snippet.code);
      parts.push("```");
      return parts.join("\n");
    }
    case "command":
      return ["```bash", block.command.command, "```"].join("\n");
  }
}

function buildGuideMarkdown(page: GuidePage): string {
  const lines: string[] = [];

  lines.push(`# ${page.title}`);
  lines.push("");
  if (page.tagline) {
    lines.push(`_${page.tagline}_`);
    lines.push("");
  }
  lines.push(page.description);
  lines.push("");

  for (const section of page.sections) {
    lines.push(`## ${section.heading}`);
    lines.push("");
    for (const block of section.blocks) {
      lines.push(renderBlock(block));
      lines.push("");
    }
  }

  return lines.join("\n").trim() + "\n";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  let page: GuidePage;
  try {
    page = getGuidePage(slug);
  } catch {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const markdown = buildGuideMarkdown(page);

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
