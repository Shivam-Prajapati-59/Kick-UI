import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { ComponentPreviewClient } from "@/components/docs/ComponentPreviewClient";
import { getAllComponents, getComponent } from "@/lib/component-registry";
import { CodeOptionsProvider } from "@/hooks/useCodeOptions";

interface PublicRegistryFile {
  content?: string;
}

interface PublicRegistryItem {
  files?: PublicRegistryFile[];
}

function getSourceFromPublicRegistry(slug: string) {
  const filePath = path.join(process.cwd(), "public", "r", `${slug}.json`);
  if (!fs.existsSync(filePath)) return "";

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8")) as PublicRegistryItem;
    return parsed.files?.[0]?.content ?? "";
  } catch {
    return "";
  }
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
    <div className="max-w-4xl w-full space-y-6">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{component.name}</h1>
        <p className="text-muted-foreground text-lg">{component.description}</p>
      </header>

      <CodeOptionsProvider>
        <ComponentPreviewClient
          slug={slug}
          sourceCode={sourceCode}
          dependencies={component.dependencies}
        />
      </CodeOptionsProvider>
    </div>
  );
}
