import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLI",
  description:
    "Install any Kick UI component straight into your project with a single shadcn CLI command you own.",
  alternates: {
    canonical: "/docs/cli",
  },
};

export default function CliPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">CLI</h1>
      <p className="text-muted-foreground text-lg">Content coming soon.</p>
    </main>
  );
}
