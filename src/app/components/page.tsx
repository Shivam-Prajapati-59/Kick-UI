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

export const metadata: Metadata = {
  title: "Components",
  description:
    "Browse every Kick UI component — animated buttons, cards, text effects, docks, carousels, and layout sections. Copy the install command and ship in seconds.",
  alternates: {
    canonical: "/components",
  },
};

export default function ComponentsPage() {
  const docsByCategory = getComponentDocsByCategory();

  return (
    <div className="space-y-8">
      <header className="max-w-3xl space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Components</h1>
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
