import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { ComponentPreviewClient } from "@/components/docs/ComponentPreviewClient";
import { getAllComponents, getComponent } from "@/lib/component-registry";
import { CodeOptionsProvider } from "@/hooks/useCodeOptions";


/** Slug → source-file mapping for components that don't have a public registry JSON yet */
const CUSTOM_SOURCE_MAP: Record<string, string> = {
  "cursor-web-fluid": "src/components/demo/Animations/CursorWebFluid/CursorWebFluid.tsx",
};

interface PublicRegistryItem {
  files?: Array<{ content?: string }>;
}


function getSourceFromPublicRegistry(slug: string): string {
  // 1. Try public/r/<slug>.json (shadcn registry format)
  const jsonPath = path.join(process.cwd(), "public", "r", `${slug}.json`);
  if (fs.existsSync(jsonPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as PublicRegistryItem;
      const content = parsed.files?.[0]?.content ?? "";
      if (content) return content;
    } catch {
      // fall through
    }
  }

  // 2. Fallback: read the source file directly
  const relPath = CUSTOM_SOURCE_MAP[slug];
  if (relPath) {
    const absPath = path.join(process.cwd(), relPath);
    if (fs.existsSync(absPath)) {
      try {
        return fs.readFileSync(absPath, "utf-8");
      } catch {
        // fall through
      }
    }
  }

  return "";
}

export async function generateStaticParams() {
  return getAllComponents().map((component) => ({ slug: component.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = getComponent(slug);
  return {
    title: component ? `${component.name} - Kick UI` : "Component - Kick UI",
    description: component?.description ?? "A Kick UI component",
  };
}

export default async function ComponentDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const component = getComponent(slug);
  if (!component) return notFound();

  const sourceCode = getSourceFromPublicRegistry(slug);

  return (
    <div className="w-full space-y-6">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{component.name}</h1>
        <p className="text-muted-foreground text-lg font-sans">{component.description}</p>
      </header>

      <CodeOptionsProvider>
        <ComponentPreviewClient
          slug={slug}
          sourceCode={sourceCode}
          sourceFilename={component.sourceFilename}
          dependencies={component.dependencies}
        />
      </CodeOptionsProvider>

    </div>
  );
}
