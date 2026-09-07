import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Utilities",
  description:
    "Add the shared class-merging utility and helpers that Kick UI components import in every example.",
  alternates: {
    canonical: "/docs/utilities",
  },
};

export default function AddUtilitiesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Add Utilities</h1>
      <p className="text-muted-foreground text-lg">Content coming soon.</p>
    </main>
  );
}
