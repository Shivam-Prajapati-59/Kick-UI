import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/docs/mdx-components";
import { ComponentPreviewServer } from "@/components/docs/ComponentPreviewServer";
import { InstallCommand, Steps, Step } from "@/components/docs/Steps";
import CodeBlock from "@/components/docs/CodeBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getComponent } from "@/lib/component-registry";
import { CodeOptionsProvider } from "@/hooks/useCodeOptions";

// Code documentation components
import {
  CodeHighlighter,
  CodeOptions,
  CSS,
  Tailwind,
  TSCSS,
  TSTailwind,
  CliInstallation,
  CodeExample,
  CodeDependencies,
} from "@/components/code";

const CONTENT_DIR = path.join(process.cwd(), "src/content/components");

function getMdxSource(slug: string) {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { content, data } = matter(raw);
  return { content, frontmatter: data };
}

export async function generateStaticParams() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR);
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => ({ slug: f.replace(".mdx", "") }));
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
  const mdx = getMdxSource(slug);
  if (!mdx) return notFound();

  const components = {
    ...mdxComponents,
    // Layout/preview
    ComponentPreview: ComponentPreviewServer,
    // Legacy install components (still available in MDX)
    InstallCommand,
    Steps,
    Step,
    // Tabs
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    // Docs
    CodeBlock,
    // Code documentation system
    CodeHighlighter,
    CodeOptions,
    CSS,
    Tailwind,
    TSCSS,
    TSTailwind,
    CliInstallation,
    CodeExample,
    CodeDependencies,
  };

  return (
    <div className="max-w-4xl w-full">
      <CodeOptionsProvider>
        <article className="prose-custom">
          <MDXRemote source={mdx.content} components={components} />
        </article>
      </CodeOptionsProvider>
    </div>
  );
}
