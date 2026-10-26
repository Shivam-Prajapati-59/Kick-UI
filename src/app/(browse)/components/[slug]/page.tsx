import { notFound } from "next/navigation";
import { ComponentPreviewClient } from "@/components/docs/ComponentPreviewClient";
import { CodeOptionsProvider } from "@/hooks/useCodeOptions";
import { getAllComponentDocs, getComponentDoc } from "@/lib/component-docs";
import { SITE_CONFIG } from "@/lib/site-config";

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

  const title = component.seoTitle ?? component.title;
  const description = component.description;
  const url = `/components/${component.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      title: `${title} — ${SITE_CONFIG.name}`,
      description,
      siteName: SITE_CONFIG.name,
      images: [`${SITE_CONFIG.url}/og-image.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${SITE_CONFIG.name}`,
      description,
      images: [`${SITE_CONFIG.url}/og-image.png`],
    },
  };
}

/** Source code and breadcrumb structured data for component pages. */
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
        "@type": "SoftwareSourceCode",
        name: `${title} — ${SITE_CONFIG.name}`,
        description,
        url: `${SITE_CONFIG.url}/components/${slug}`,
        codeRepository: SITE_CONFIG.github,
        programmingLanguage: "TypeScript",
        runtimePlatform: "React",
        author: { "@id": `${SITE_CONFIG.url}#organization` },
        keywords: [category, "react", "web3", "tailwind css"].join(", "),
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
      dangerouslySetInnerHTML={{
        // Escape `<` so a `</script>` sequence in content can never break out.
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
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
    <article className="w-full space-y-6 py-4">
      <ComponentJsonLd
        slug={component.slug}
        title={component.title}
        description={component.description}
        category={component.category}
      />
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">{component.title}</h1>
        <p className="text-muted-foreground text-lg">{component.description}</p>
      </header>

      <CodeOptionsProvider>
        <ComponentPreviewClient
          slug={component.slug}
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
