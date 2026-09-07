import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Install Next.js",
  description:
    "Create a Next.js project with everything Kick UI components expect: App Router, TypeScript, and Tailwind CSS.",
  alternates: {
    canonical: "/docs/nextjs",
  },
};

export default function InstallNextJsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Install Next.js</h1>
      <p className="text-muted-foreground text-lg">Content coming soon.</p>
    </main>
  );
}
