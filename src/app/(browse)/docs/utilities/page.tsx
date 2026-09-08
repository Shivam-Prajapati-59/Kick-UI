import type { Metadata } from "next";
import CodeBlock from "@/components/docs/CodeBlock";
import { terminalTokens } from "@/lib/code-tokens";

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
    <article className="w-full max-w-3xl space-y-8 py-4">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Add Utilities</h1>
        <p className="text-muted-foreground text-lg">
          Three small packages power conditional classes and animation across
          every Kick UI example.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Install dependencies
        </h2>
        <CodeBlock tokens={terminalTokens}>
          npm install clsx tailwind-merge motion
        </CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Add the util file
        </h2>
        <p className="text-muted-foreground">
          Save this as <code>lib/utils.ts</code> — it is the exact helper Kick
          UI examples import:
        </p>
        <CodeBlock language="tsx">{`import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`}</CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Use the utility
        </h2>
        <p className="text-muted-foreground">
          Use <code>cn</code> anywhere you need conditional classes that still
          merge Tailwind conflicts cleanly:
        </p>
        <CodeBlock language="tsx">{`import { cn } from "@/lib/utils";

export function Example({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md border px-4 py-2 text-sm",
        active && "border-neutral-950 bg-neutral-950 text-white"
      )}
    >
      Kick UI
    </div>
  );
}`}</CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Motion on React 19
        </h2>
        <p className="text-muted-foreground">
          Kick UI uses stable <code>motion</code> (v12), which supports React 19
          out of the box — no alpha builds and no <code>overrides</code> block
          needed. That workaround belonged to the Next 15 / React 19
          release-candidate era; do not copy it into a current project.
          Components that need anything beyond these three packages show their
          exact install command on their own component page.
        </p>
      </section>
    </article>
  );
}
