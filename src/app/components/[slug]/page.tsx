import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/docs/mdx-components";
import { ComponentPreviewServer } from "@/components/docs/ComponentPreviewServer";
import { InstallCommand, Steps, Step } from "@/components/docs/Steps";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Container from "@/components/common/Container";
import { getComponent } from "@/lib/component-registry";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "next-view-transitions";

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

  const component = getComponent(slug);

  const components = {
    ...mdxComponents,
    ComponentPreview: ComponentPreviewServer,
    InstallCommand,
    Steps,
    Step,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  };

  return (
    <Container className="max-w-4xl py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/components"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Components
        </Link>
      </div>

      {/* Header */}
      {component && (
        <div className="mb-8 space-y-2">
          <Badge variant="secondary" className="mb-2">
            {component.category}
          </Badge>
        </div>
      )}

      {/* MDX Content */}
      <article className="prose-custom">
        <MDXRemote source={mdx.content} components={components} />
      </article>
    </Container>
  );
}
