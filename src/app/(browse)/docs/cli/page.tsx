import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import CodeBlock from "@/components/docs/CodeBlock";
import CommandTabs from "@/components/code/CommandTabs";
import { CodeOptionsProvider } from "@/hooks/useCodeOptions";
import { terminalTokens } from "@/lib/code-tokens";

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
    <CodeOptionsProvider>
      <article className="w-full max-w-3xl space-y-8 py-4">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">CLI</h1>
          <p className="text-muted-foreground text-lg">
            Everything installs through the shadcn CLI — pick a component, run
            one command, own the source. Switch the package manager once and
            every command below follows.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Initialization
          </h2>
          <p className="text-muted-foreground">
            Run once per project, before adding your first component:
          </p>
          <CommandTabs command="shadcn@latest init" snippetId="cli-init" />
          <p className="text-muted-foreground">
            Answer the prompts to match the Kick UI setup:
          </p>
          <CodeBlock
            tokens={terminalTokens}
          >{`Which style would you like to use? New York
Which color would you like to use as base color? Neutral
Do you want to use CSS variables for colors? yes`}</CodeBlock>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Installing Kick UI with the shadcn CLI
          </h2>
          <p className="text-muted-foreground">
            Install by URL from any component page — swap in any slug from the
            catalog:
          </p>
          <CommandTabs
            command="shadcn@latest add https://kick-ui.vercel.app/r/shiny-button.json"
            snippetId="cli-add-url"
          />
          <p className="text-muted-foreground">
            The pattern is <code>.../r/[component].json</code> — for example,{" "}
            <code>mag-dock.json</code> installs as{" "}
            <code>@kick-ui/mag-dock</code>. Browse every slug in the{" "}
            <Link
              href="/components"
              className="text-primary font-medium hover:underline"
            >
              component catalog
            </Link>
            .
          </p>
          <CodeBlock>{`Usage: shadcn add [options] [components...]

add a component to your project

Arguments:
  components        the components to add or a url to the component.

Options:
  -y, --yes         skip confirmation prompt
  -o, --overwrite   overwrite existing files
  -c, --cwd <cwd>   the working directory
  -p, --path <path> the path to add the component to
  -h, --help        display help for command`}</CodeBlock>
          <p className="text-muted-foreground">
            Or register the namespace once in <code>components.json</code> and
            use short names everywhere:
          </p>
          <CodeBlock language="json">{`{
  "registries": {
    "@kick-ui": "https://kick-ui.vercel.app/r/{name}.json"
  }
}`}</CodeBlock>
          <CommandTabs
            command="shadcn@latest add @kick-ui/shiny-button"
            snippetId="cli-add-ns"
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Useful flags
          </h2>
          <p className="text-muted-foreground">
            <code>-y</code> skips confirmation, <code>-o</code> overwrites
            existing files, and <code>-c</code> targets a workspace — handy in
            monorepos.
          </p>
          <CommandTabs
            command="shadcn@latest add @kick-ui/shiny-button -y"
            snippetId="cli-flag-yes"
          />
          <CommandTabs
            command="shadcn@latest add @kick-ui/shiny-button -o"
            snippetId="cli-flag-overwrite"
          />
          <CommandTabs
            command="shadcn@latest add @kick-ui/shiny-button -c ./apps/web"
            snippetId="cli-flag-cwd"
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Search and discovery
          </h2>
          <p className="text-muted-foreground">
            Browse the registry without installing anything:
          </p>
          <CommandTabs
            command="shadcn@latest view @kick-ui"
            snippetId="cli-view"
          />
          <CommandTabs
            command='shadcn@latest search @kick-ui -q "card"'
            snippetId="cli-search"
          />
          <CommandTabs
            command="shadcn@latest list @kick-ui"
            snippetId="cli-list"
          />
        </section>

        <section className="space-y-4 pb-4">
          <h2 className="text-2xl font-semibold tracking-tight">MCP server</h2>
          <p className="text-muted-foreground">
            Give your AI assistant direct access to the registry, then ask for
            components in plain language:
          </p>
          <CommandTabs command="shadcn@latest mcp init" snippetId="cli-mcp" />
          <p className="text-muted-foreground">
            For example: “Add @kick-ui/shiny-button to my project.” For the full
            command reference, see the{" "}
            <a
              href="https://ui.shadcn.com/docs/cli"
              target="_blank"
              rel="noreferrer"
              className="text-primary font-medium hover:underline"
            >
              shadcn CLI docs
            </a>
            .
          </p>
        </section>
      </article>
    </CodeOptionsProvider>
  );
}
