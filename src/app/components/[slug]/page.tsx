import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { ComponentPreviewClient } from "@/components/docs/ComponentPreviewClient";
import { DemoRenderer } from "@/components/docs/DemoRenderer";
import { mdxComponents } from "@/components/docs/mdx-components";
import { CodeOptionsProvider } from "@/hooks/useCodeOptions";
import { getAllComponentDocs, getComponentDoc } from "@/lib/component-docs";

export async function generateStaticParams() {
  return getAllComponentDocs().map((component) => ({ slug: component.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const component = getComponentDoc((await params).slug);
  return {
    title: component ? `${component.title} - Kick UI` : "Component - Kick UI",
    description: component?.description ?? "A Kick UI component",
  };
}

export default async function ComponentDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const component = getComponentDoc((await params).slug);
  if (!component) notFound();

  const { content } = await compileMDX({
    source: component.body,
    components: mdxComponents,
  });

  return (
    <article className="w-full space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{component.title}</h1>
        <p className="text-lg text-muted-foreground">{component.description}</p>
      </header>

      <CodeOptionsProvider>
        <ComponentPreviewClient
          slug={component.slug}
          preview={<DemoRenderer name={component.demo} />}
          fullPreview={component.fullPreview}
          sourceCode={component.sourceCode}
          sourceFilename={component.sourceFilename}
          dependencies={component.dependencies}
          registryUrl={component.registryUrl}
          usage={component.usage}
          propsData={component.props}
        />
      </CodeOptionsProvider>

      <div className="max-w-3xl">{content}</div>
    </article>
  );
}
