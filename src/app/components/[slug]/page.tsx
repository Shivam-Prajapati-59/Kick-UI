import { notFound } from "next/navigation";
import { ComponentPreviewClient } from "@/components/docs/ComponentPreviewClient";
import { DemoRenderer, type DemoName } from "@/components/docs/DemoRenderer";
import { CodeOptionsProvider } from "@/hooks/useCodeOptions";
import { getAllComponentDocs, getComponentDoc } from "@/lib/component-docs";
import { SITE_CONFIG } from "@/lib/site-config";
import { getCategoryMetadata } from "@/lib/component-categories";

export async function generateStaticParams() {
  return getAllComponentDocs().map((component) => ({ slug: component.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const component = getComponentDoc((await params).slug);
  if (!component) return { title: "Component not found" };

  const title = component.title;
  const description = component.description;
  const url = `/components/${component.slug}`;

  return {
    title,
    description,
    keywords: [
      `${title} react component`,
      `${title} shadcn`,
      getCategoryMetadata(component.category).label.toLowerCase(),
      ...SITE_CONFIG.keywords.slice(0, 4),
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      title: `${title} — ${SITE_CONFIG.name}`,
      description,
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${SITE_CONFIG.name}`,
      description,
    },
  };
}

/** SoftwareApplication + BreadcrumbList structured data for rich results. */
function ComponentJsonLd({
  slug,
  title,
  description,
  category,
}: {
  slug: string;
  title: string;
  description: string;
  category: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: `${title} — ${SITE_CONFIG.name}`,
        description,
        url: `${SITE_CONFIG.url}/components/${slug}`,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        author: { "@id": `${SITE_CONFIG.url}#organization` },
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        keywords: [category, "react", "shadcn", "tailwind css"].join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_CONFIG.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Components",
            item: `${SITE_CONFIG.url}/components`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: title,
            item: `${SITE_CONFIG.url}/components/${slug}`,
          },
        ],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ComponentDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const component = getComponentDoc((await params).slug);
  if (!component) notFound();

  return (
    <article className="w-full space-y-6">
      <ComponentJsonLd
        slug={component.slug}
        title={component.title}
        description={component.description}
        category={component.category}
      />
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{component.title}</h1>
        <p className="text-muted-foreground text-lg">{component.description}</p>
      </header>

      <CodeOptionsProvider>
        <ComponentPreviewClient
          slug={component.slug}
          preview={<DemoRenderer name={component.demo as DemoName} />}
          fullPreview={component.fullPreview}
          sourceCode={component.sourceCode}
          sourceFilename={component.sourceFilename}
          dependencies={component.dependencies}
          registryUrl={component.registryUrl}
          usage={component.usage}
          propsData={component.props}
        />
      </CodeOptionsProvider>
    </article>
  );
}
