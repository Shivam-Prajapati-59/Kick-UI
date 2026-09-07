import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Install Tailwind CSS",
  description:
    "Add Tailwind CSS with the design tokens and theme variables that power every Kick UI component.",
  alternates: {
    canonical: "/docs/tailwind-css",
  },
};

export default function InstallTailwindPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">
        Install Tailwind CSS
      </h1>
      <p className="text-muted-foreground text-lg">Content coming soon.</p>
    </main>
  );
}
