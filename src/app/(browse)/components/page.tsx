import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { componentCategories } from "@/lib/component-categories";
import { getComponentDocsByCategory } from "@/lib/component-docs";

import { SITE_CONFIG } from "@/lib/site-config";

const title = "Animated React & Web3 UI Components";
const description =
  "Explore animated React and Web3 UI components for trading dashboards, wallets, and modern apps. Preview each component and install its source with the shadcn CLI.";
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
              {docs.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/components/${doc.slug}`}
                  className="focus-visible:ring-ring rounded-xl focus-visible:ring-2 focus-visible:outline-none"
                >
                  <Card className="border-border/60 hover:bg-muted/50 h-full transition-colors">
                    <CardHeader className="space-y-3">
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {doc.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
