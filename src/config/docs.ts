/**
 * Single source of truth for installation guide pages.
 *
 * Everything below derives from this module — never redeclare a guide's
 * slug, title, description, sections, or snippets anywhere else:
 * - src/config/Sidebar.tsx builds the Installation sidebar section,
 * - each guide page reads its own entry for metadata and renders it
 *   through <GuidePage>,
 * - src/app/sitemap.ts lists the guide routes,
 * - tests/e2e/final-audit.mjs crawls them.
 *
 * Pure data, zero imports: pipeline scripts and e2e suites import this
 * file directly. Paragraphs support `code` spans and [label](href) links;
 * snippets are raw strings (no backticks or ${} inside, so they stay
 * valid inside template literals).
 */

export type GuideSnippetMode =
  "terminal" | "text" | "javascript" | "json" | "css" | "tsx";

export interface GuideSnippet {
  mode: GuideSnippetMode;
  code: string;
  /** Rendered above the block (outside the copyable code). */
  filename?: string;
}

export interface GuideCommand {
  command: string;
  snippetId: string;
}

export type GuideBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "snippet"; snippet: GuideSnippet }
  | { kind: "command"; command: GuideCommand };

export interface GuideContentSection {
  heading: string;
  blocks: GuideBlock[];
}

export interface GuidePage {
  slug: string;
  title: string;
  description: string;
  tagline?: string;
  sections: GuideContentSection[];
}

export interface GuideSection {
  title: string;
  pages: GuidePage[];
}

/** Installation guides, in sidebar order. Route: `/docs/<slug>`. */
export const guideSections: GuideSection[] = [
  {
    title: "Installation",
    pages: [
      {
        slug: "nextjs",
        title: "Install Next.js",
        description:
          "Create a Next.js project with everything Kick UI components expect: App Router, TypeScript, and Tailwind CSS.",
        tagline:
          "Scaffold the App Router foundation that every Kick UI example assumes.",
        sections: [
          {
            heading: "Create a new project",
            blocks: [
              {
                kind: "snippet",
                snippet: {
                  mode: "terminal",
                  code: "npx create-next-app@latest my-app",
                },
              },
            ],
          },
          {
            heading: "Answer the prompts",
            blocks: [
              {
                kind: "paragraph",
                text: "Accept the recommended defaults — they match the Kick UI setup exactly:",
              },
              {
                kind: "snippet",
                snippet: {
                  mode: "terminal",
                  code: `What is your project named? my-app
Would you like to use the recommended Next.js defaults?
  Yes, use recommended defaults - TypeScript, ESLint, Tailwind CSS, App Router, AGENTS.md
  No, reuse previous settings
  No, customize settings - Choose your own preferences`,
                },
              },
            ],
          },
          {
            heading: "If you customize settings",
            blocks: [
              {
                kind: "paragraph",
                text: "Choose these answers to stay compatible with Kick UI examples:",
              },
              {
                kind: "snippet",
                snippet: {
                  mode: "terminal",
                  code: `Would you like to use TypeScript? Yes
Which linter would you like to use? ESLint
Would you like to use React Compiler? No
Would you like to use Tailwind CSS? Yes
Would you like your code inside a src/ directory? Yes
Would you like to use App Router? (recommended) Yes
Would you like to customize the import alias (@/* by default)? No
Would you like to include AGENTS.md to guide coding agents? Yes`,
                },
              },
            ],
          },
          {
            heading: "Start the app",
            blocks: [
              {
                kind: "snippet",
                snippet: {
                  mode: "terminal",
                  code: `cd my-app
npm run dev`,
                },
              },
            ],
          },
        ],
      },
      {
        slug: "tailwind-css",
        title: "Install Tailwind CSS",
        description:
          "Add Tailwind CSS with the design tokens and theme variables that power every Kick UI component.",
        tagline:
          "Kick UI targets Tailwind CSS v4 — one import, zero config files.",
        sections: [
          {
            heading: "Install the packages",
            blocks: [
              {
                kind: "snippet",
                snippet: {
                  mode: "terminal",
                  code: "npm install tailwindcss @tailwindcss/postcss",
                },
              },
            ],
          },
          {
            heading: "Register the PostCSS plugin",
            blocks: [
              {
                kind: "paragraph",
                text: "In v4 the PostCSS plugin lives in its own package — pointing the config at bare `tailwindcss` is the old v3 setup and fails with “trying to use tailwindcss directly as a PostCSS plugin”.",
              },
              {
                kind: "snippet",
                snippet: {
                  mode: "javascript",
                  code: `// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;`,
                },
              },
            ],
          },
          {
            heading: "Import it in your CSS",
            blocks: [
              {
                kind: "paragraph",
                text: "A single import replaces the old three-line `@tailwind base/components/utilities` block, and no `tailwind.config` file is needed to start:",
              },
              {
                kind: "snippet",
                snippet: { mode: "css", code: `@import "tailwindcss";` },
              },
            ],
          },
          {
            heading: "Create your CSS file",
            blocks: [
              {
                kind: "paragraph",
                text: "v4 is CSS-first: variants and theme tokens live in the stylesheet itself. This mirrors the top of Kick UI's own `globals.css` — import, dark variant, then tokens:",
              },
              {
                kind: "snippet",
                snippet: {
                  mode: "css",
                  code: `/* app/globals.css */
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-mono: "Geist Mono", monospace;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}`,
                },
              },
            ],
          },
          {
            heading: "Start your build process",
            blocks: [
              {
                kind: "snippet",
                snippet: { mode: "terminal", code: "npm run dev" },
              },
            ],
          },
          {
            heading: "Start using Tailwind",
            blocks: [
              {
                kind: "paragraph",
                text: "Drop a utility-first component into `app/page.tsx` and confirm the styles apply:",
              },
              {
                kind: "snippet",
                snippet: {
                  mode: "tsx",
                  code: `export default function Home() {
  return <h1 className="text-3xl font-bold underline">Hello world!</h1>;
}`,
                },
              },
            ],
          },
          {
            heading: "What changed from v3",
            blocks: [
              {
                kind: "paragraph",
                text: "Drop `autoprefixer` and `postcss-import` if you are migrating — v4 handles vendor prefixing and imports internally. Theme tokens move into CSS with `@theme`, which is exactly how Kick UI defines its palette.",
              },
            ],
          },
        ],
      },
      {
        slug: "utilities",
        title: "Add Utilities",
        description:
          "Add the shared class-merging utility and helpers that Kick UI components import in every example.",
        tagline:
          "Three small packages power conditional classes and animation across every Kick UI example.",
        sections: [
          {
            heading: "Install dependencies",
            blocks: [
              {
                kind: "snippet",
                snippet: {
                  mode: "terminal",
                  code: "npm install clsx tailwind-merge motion",
                },
              },
            ],
          },
          {
            heading: "Add the util file",
            blocks: [
              {
                kind: "paragraph",
                text: "Save this as `lib/utils.ts` — it is the exact helper Kick UI examples import:",
              },
              {
                kind: "snippet",
                snippet: {
                  mode: "tsx",
                  code: `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`,
                },
              },
            ],
          },
          {
            heading: "Use the utility",
            blocks: [
              {
                kind: "paragraph",
                text: "Use `cn` anywhere you need conditional classes that still merge Tailwind conflicts cleanly:",
              },
              {
                kind: "snippet",
                snippet: {
                  mode: "tsx",
                  code: `import { cn } from "@/lib/utils";

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
}`,
                },
              },
            ],
          },
          {
            heading: "Motion on React 19",
            blocks: [
              {
                kind: "paragraph",
                text: "Kick UI uses stable `motion` (v12), which supports React 19 out of the box — no alpha builds and no `overrides` block needed. That workaround belonged to the Next 15 / React 19 release-candidate era; do not copy it into a current project. Components that need anything beyond these three packages show their exact install command on their own component page.",
              },
            ],
          },
        ],
      },
      {
        slug: "cli",
        title: "CLI",
        description:
          "Install any Kick UI component straight into your project with a single shadcn CLI command you own.",
        tagline: "Installing Kick UI with the Shadcn CLI",
        sections: [
          {
            heading: "Initialization",
            blocks: [
              {
                kind: "command",
                command: {
                  command: "shadcn@latest init",
                  snippetId: "cli-init",
                },
              },
              {
                kind: "paragraph",
                text: "Answer the prompts to match the Kick UI setup:",
              },
              {
                kind: "snippet",
                snippet: {
                  mode: "terminal",
                  code: `Which style would you like to use? New York
Which color would you like to use as base color? Neutral
Do you want to use CSS variables for colors? yes`,
                },
              },
            ],
          },
          {
            heading: "Installing Kick UI with the shadcn CLI",
            blocks: [
              {
                kind: "paragraph",
                text: "Install by URL from any component page — swap in any slug from the catalog:",
              },
              {
                kind: "command",
                command: {
                  command:
                    "shadcn@latest add https://kick-ui.vercel.app/r/shiny-button.json",
                  snippetId: "cli-add-url",
                },
              },
              {
                kind: "paragraph",
                text: "The pattern is `.../r/[component].json` — for example, `mag-dock.json` installs as `@kick-ui/mag-dock`. Browse every slug in the [component catalog](/components).",
              },
              {
                kind: "snippet",
                snippet: {
                  mode: "json",
                  filename: "components.json",
                  code: `{
  "registries": {
    "@kick-ui": "https://kick-ui.vercel.app/r/{name}.json"
  }
}`,
                },
              },
              {
                kind: "command",
                command: {
                  command: "shadcn@latest add @kick-ui/shiny-button",
                  snippetId: "cli-add-ns",
                },
              },
            ],
          },
          {
            heading: "Useful flags",
            blocks: [
              {
                kind: "paragraph",
                text: "`-y` skips confirmation, `-o` overwrites existing files, and `-c` targets a workspace — handy in monorepos.",
              },
              {
                kind: "command",
                command: {
                  command: "shadcn@latest add @kick-ui/shiny-button -y",
                  snippetId: "cli-flag-yes",
                },
              },
              {
                kind: "command",
                command: {
                  command: "shadcn@latest add @kick-ui/shiny-button -o",
                  snippetId: "cli-flag-overwrite",
                },
              },
              {
                kind: "command",
                command: {
                  command:
                    "shadcn@latest add @kick-ui/shiny-button -c ./apps/web",
                  snippetId: "cli-flag-cwd",
                },
              },
            ],
          },
          {
            heading: "Search and discovery",
            blocks: [
              {
                kind: "paragraph",
                text: "Browse the registry without installing anything:",
              },
              {
                kind: "command",
                command: {
                  command: "shadcn@latest view @kick-ui",
                  snippetId: "cli-view",
                },
              },
              {
                kind: "command",
                command: {
                  command: 'shadcn@latest search @kick-ui -q "card"',
                  snippetId: "cli-search",
                },
              },
              {
                kind: "command",
                command: {
                  command: "shadcn@latest list @kick-ui",
                  snippetId: "cli-list",
                },
              },
            ],
          },
          {
            heading: "MCP server",
            blocks: [
              {
                kind: "paragraph",
                text: "The shadcn MCP server lets AI assistants interact with registry items directly. You can browse available components, search for specific ones, and install them into your project using natural language.",
              },
              {
                kind: "paragraph",
                text: "For example: “Build a landing page using components from the Kick UI registry” or “Find me a carousel from the Kick UI registry”.",
              },
              {
                kind: "paragraph",
                text: "Add the Kick UI registry to your project's components.json file as shown above, then add the MCP server:",
              },
              {
                kind: "snippet",
                snippet: {
                  mode: "json",
                  filename: "components.json",
                  code: `{
  "registries": {
    "@kick-ui": "https://kick-ui.vercel.app/r/{name}.json"
  }
}`,
                },
              },
              {
                kind: "command",
                command: {
                  command: "shadcn@latest mcp init",
                  snippetId: "cli-mcp",
                },
              },
              {
                kind: "paragraph",
                text: "For example: “Add @kick-ui/shiny-button to my project.” For the full command reference, see the [shadcn CLI docs](https://ui.shadcn.com/docs/cli).",
              },
            ],
          },
        ],
      },
    ],
  },
];

export function guideHref(slug: string): string {
  return `/docs/${slug}`;
}

/** Landing target for the retired `/docs` index route. */
export const DEFAULT_GUIDE_SLUG = "cli";

export function getGuidePage(slug: string): GuidePage {
  const page = guideSections
    .flatMap((section) => section.pages)
    .find((entry) => entry.slug === slug);
  if (!page) {
    throw new Error(
      `Unknown guide slug "${slug}". Add it to src/config/docs.ts first.`,
    );
  }
  return page;
}
