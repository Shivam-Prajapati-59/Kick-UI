import type { Metadata } from "next";
import { componentCategories } from "@/lib/component-categories";
import { getComponentDocsByCategory } from "@/lib/component-docs";
import { ComponentCatalogCard } from "@/components/catalog/ComponentCatalogCard";
import { CatalogPreview } from "@/components/catalog/CatalogPreview";
import { SITE_CONFIG } from "@/lib/site-config";
import { stillPreviewComponents } from "@/components/catalog/stills";

const title = "Animated React & Web3 UI Components";
const description =
  "Browse animated React and Web3 UI components for wallets, trading dashboards, and dapps. Preview and install with shadcn.";
const url = `${SITE_CONFIG.url}/components`;
const socialTitle = `${title} | ${SITE_CONFIG.name}`;
const image = `${SITE_CONFIG.url}/og-image.png`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    siteName: SITE_CONFIG.name,
    title: socialTitle,
    description,
    images: [{
      url: image,
      width: 1200,
      height: 630,
      alt: "Kick UI logo and illustrated Web3 interface",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description,
    images: [image],
  },
};
export default function ComponentsPage() {
  const docsByCategory = getComponentDocsByCategory();

  return (
    <div className="space-y-12 pb-4">
      <header className="max-w-3xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Animated React & Web3 UI Components</h1>
        <p className="text-muted-foreground text-lg">
          Accessible, customizable React components you can preview, copy, and
          install.
        </p>
      </header>

      {componentCategories.map((category) => {
        const docs = docsByCategory[category.id] ?? [];
        if (!docs.length) return null;
        return (
          <section
            key={category.id}
            aria-labelledby={category.id}
            className="space-y-5"
          >
            <div>
              <h2 id={category.id} className="text-2xl font-semibold">
                {category.label}
              </h2>
              <p className="text-muted-foreground text-sm">
                {category.description}
              </p>
            </div>
            <div className="grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((doc) => {
                const StillPreview = stillPreviewComponents[doc.slug];

                return (
                  <ComponentCatalogCard
                    key={doc.slug}
                    slug={doc.slug}
                    title={doc.title}
                    description={doc.description}
                    preview={
                      StillPreview ? (
                        <StillPreview />
                      ) : (
                        <CatalogPreview slug={doc.slug} title={doc.title} />
                      )
                    }
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
