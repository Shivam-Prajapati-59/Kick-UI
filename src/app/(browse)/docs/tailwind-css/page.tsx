import type { Metadata } from "next";
import CodeBlock from "@/components/docs/CodeBlock";
import { terminalTokens } from "@/lib/code-tokens";

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
    <article className="w-full max-w-3xl space-y-8 py-4">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Install Tailwind CSS
        </h1>
        <p className="text-muted-foreground text-lg">
          Kick UI targets Tailwind CSS v4 — one import, zero config files.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Install the packages
        </h2>
        <CodeBlock
          tokens={terminalTokens}
        >{`npm install tailwindcss @tailwindcss/postcss`}</CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Register the PostCSS plugin
        </h2>
        <p className="text-muted-foreground">
          In v4 the PostCSS plugin lives in its own package — pointing the
          config at bare <code>tailwindcss</code> is the old v3 setup and fails
          with “trying to use tailwindcss directly as a PostCSS plugin”.
        </p>
        <CodeBlock language="javascript">{`// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;`}</CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Import it in your CSS
        </h2>
        <p className="text-muted-foreground">
          A single import replaces the old three-line{" "}
          <code>@tailwind base/components/utilities</code> block, and no{" "}
          <code>tailwind.config</code> file is needed to start:
        </p>
        <CodeBlock language="css">{`@import "tailwindcss";`}</CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Create your CSS file
        </h2>
        <p className="text-muted-foreground">
          v4 is CSS-first: variants and theme tokens live in the stylesheet
          itself. This mirrors the top of Kick UI&apos;s own{" "}
          <code>globals.css</code> — import, dark variant, then tokens:
        </p>
        <CodeBlock language="css">{`/* app/globals.css */
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-mono: "Geist Mono", monospace;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}`}</CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Start your build process
        </h2>
        <CodeBlock tokens={terminalTokens}>npm run dev</CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Start using Tailwind
        </h2>
        <p className="text-muted-foreground">
          Drop a utility-first component into <code>app/page.tsx</code> and
          confirm the styles apply:
        </p>
        <CodeBlock language="tsx">{`export default function Home() {
  return <h1 className="text-3xl font-bold underline">Hello world!</h1>;
}`}</CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          What changed from v3
        </h2>
        <p className="text-muted-foreground">
          Drop <code>autoprefixer</code> and <code>postcss-import</code> if you
          are migrating — v4 handles vendor prefixing and imports internally.
          Theme tokens move into CSS with <code>@theme</code>, which is exactly
          how Kick UI defines its palette.
        </p>
      </section>
    </article>
  );
}
