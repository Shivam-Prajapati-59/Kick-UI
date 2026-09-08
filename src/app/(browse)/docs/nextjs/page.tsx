import type { Metadata } from "next";
import CodeBlock from "@/components/docs/CodeBlock";
import { terminalTokens } from "@/lib/code-tokens";

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
    <article className="w-full max-w-3xl space-y-8 py-4">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Install Next.js</h1>
        <p className="text-muted-foreground text-lg">
          Scaffold the App Router foundation that every Kick UI example assumes.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Create a new project
        </h2>
        <CodeBlock tokens={terminalTokens}>
          npx create-next-app@latest my-app
        </CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Answer the prompts
        </h2>
        <p className="text-muted-foreground">
          Accept the recommended defaults — they match the Kick UI setup
          exactly:
        </p>
        <CodeBlock tokens={terminalTokens}>{`What is your project named? my-app
Would you like to use the recommended Next.js defaults?
  Yes, use recommended defaults - TypeScript, ESLint, Tailwind CSS, App Router, AGENTS.md
  No, reuse previous settings
  No, customize settings - Choose your own preferences`}</CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          If you customize settings
        </h2>
        <p className="text-muted-foreground">
          Choose these answers to stay compatible with Kick UI examples:
        </p>
        <CodeBlock
          tokens={terminalTokens}
        >{`Would you like to use TypeScript? Yes
Which linter would you like to use? ESLint
Would you like to use React Compiler? No
Would you like to use Tailwind CSS? Yes
Would you like your code inside a src/ directory? Yes
Would you like to use App Router? (recommended) Yes
Would you like to customize the import alias (@/* by default)? No
Would you like to include AGENTS.md to guide coding agents? Yes`}</CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Start the app</h2>
        <CodeBlock tokens={terminalTokens}>{`cd my-app
npm run dev`}</CodeBlock>
      </section>
    </article>
  );
}
