import { notFound } from "next/navigation";
import Link from "next/link";
import { ComponentPreviewClient } from "@/components/docs/ComponentPreviewClient";
import { CodeOptionsProvider } from "@/hooks/useCodeOptions";
import { getAllComponentDocs, getComponentDoc } from "@/lib/component-docs";
import {
  getCategoryMetadata,
  type ComponentCategory,
} from "@/lib/component-categories";
import { componentIndex } from "@/generated/component-index";
import { SITE_CONFIG } from "@/lib/site-config";

const MAX_RELATED_COMPONENTS = 4;

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
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${SITE_CONFIG.name}`,
      description,
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

/**
 * Up to four related components: same-category neighbours first, topped up
 * with other categories in index order when the category is small.
 */
function getRelatedComponents(category: ComponentCategory, slug: string) {
  const sameCategory = componentIndex.filter(
    (item) => item.category === category && item.slug !== slug,
  );
  const related = sameCategory.slice(0, MAX_RELATED_COMPONENTS);
  if (related.length >= 2) return related;

  const others = componentIndex.filter(
    (item) => item.category !== category && item.slug !== slug,
  );
  const picked = [...related];
  for (const item of others) {
    if (picked.length >= MAX_RELATED_COMPONENTS) break;
    picked.push(item);
  }
  return picked;
}

export default async function ComponentDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const component = getComponentDoc((await params).slug);
  if (!component) notFound();

  const relatedComponents = getRelatedComponents(
    component.category,
    component.slug,
  );
  const categoryLabel = getCategoryMetadata(component.category).label;

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

      {relatedComponents.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            More {categoryLabel}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedComponents.map((item) => (
              <Link
                key={item.slug}
                href={`/components/${item.slug}`}
                className="hover:border-foreground/60 rounded-xl border p-4 transition-colors"
              >
                <p className="font-medium">{item.title}</p>
                <p className="text-muted-foreground line-clamp-1 text-sm">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
