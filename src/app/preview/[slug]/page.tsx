import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoRenderer } from "@/components/docs/DemoRenderer";
import { PreviewThemeSync } from "@/components/docs/PreviewThemeSync";
import { getAllComponentDocs, getComponentDoc } from "@/lib/component-docs";
import { montserrat } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export function generateStaticParams() {
  return getAllComponentDocs().map(({ slug }) => ({ slug }));
}

export default async function ComponentPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const component = getComponentDoc(slug);
  if (!component) notFound();

  return (
    <div
      className={cn(
        montserrat.variable,
        "relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background [font-family:var(--font-montserrat)]",
        component.fullPreview ? "p-0" : "p-6 sm:p-8",
      )}
    >
      <PreviewThemeSync />
      <DemoRenderer name={slug} />
    </div>
  );
}
