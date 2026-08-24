import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Installation guides, theming, CLI usage, and MCP integration for the Kick UI component registry.",
  alternates: {
    canonical: "/docs",
  },
};
import { Link } from "next-view-transitions";
import { ArrowRight, Check, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { componentCategories } from "@/lib/component-categories";

const installCommand =
  "npx shadcn@latest add https://kick-ui.vercel.app/r/shiny-button.json";

export default function DocsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-14 px-4 py-12 sm:px-6">
      <header className="max-w-3xl space-y-5">
        <Badge variant="secondary">Documentation</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Build polished interfaces faster.
        </h1>
        <p className="text-muted-foreground text-lg">
          Kick UI is a shadcn-compatible library of accessible, animated React
          components. Preview a component, then install its source directly in
          your project.
        </p>
        <Button asChild>
          <Link href="/components">
            Browse components <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </header>

      <section aria-labelledby="install" className="space-y-4">
        <div>
          <h2 id="install" className="text-2xl font-semibold">
            Install a component
          </h2>
          <p className="text-muted-foreground mt-1">
            Start with any component page and use its generated install command.
          </p>
        </div>
        <div className="bg-muted/30 flex items-start gap-3 rounded-xl border p-4">
          <Terminal className="text-muted-foreground mt-0.5 size-5 shrink-0" />
          <code className="overflow-x-auto text-sm">{installCommand}</code>
        </div>
      </section>

      <section aria-labelledby="principles" className="space-y-4">
        <h2 id="principles" className="text-2xl font-semibold">
          Library principles
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Accessible by default",
              "Semantic controls, focus styles, and labels are included in the documentation experience.",
            ],
            [
              "Own your code",
              "Registry installs place component source in your app, so every detail remains customizable.",
            ],
            [
              "Built for composition",
              "Components accept class names and focused props to fit naturally into existing systems.",
            ],
          ].map(([title, description]) => (
            <Card key={title}>
              <CardHeader className="space-y-2">
                <Check className="text-primary size-5" aria-hidden="true" />
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="categories" className="space-y-4">
        <h2 id="categories" className="text-2xl font-semibold">
          Explore by category
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {componentCategories.map((category) => (
            <Link
              key={category.id}
              href={`/components#${category.id}`}
              className="hover:bg-muted focus-visible:ring-ring rounded-lg border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <h3 className="font-medium">{category.label}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
