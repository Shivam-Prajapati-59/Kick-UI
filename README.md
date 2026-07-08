# Kick UI

A collection of beautifully designed, animated UI components for React. Built on Radix UI primitives, styled with Tailwind CSS v4, and powered by Motion for fluid animations.

## Documentation

Visit [kick-ui.vercel.app](https://kick-ui.vercel.app) to browse the component library, view live previews, and get installation commands.

## Installation

Components are available as a shadcn-compatible registry. To add a component to your project:

```bash
npx shadcn@latest add https://kick-ui.vercel.app/r/shiny-button.json
```

Or use the interactive CLI:

```bash
npx shadcn@latest add https://kick-ui.vercel.app/r/registry.json
```

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun dev

# Build for production
bun build

# Run tests
bun test

# Lint
bun lint

# Type check
bun typecheck

# Build registry
bun registry:build
```

## Project Structure

```
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/
│   │   └── ui/            # UI primitives (Button, Card, Dialog, etc.)
│   ├── config/            # Sidebar & navigation config
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities, types, component registry
├── registry/              # Distributable component source files
└── public/r/              # Generated registry JSON files
```

## Tech Stack

- **Framework:** Next.js 16, React 19
- **Styling:** Tailwind CSS v4
- **Primitives:** Radix UI
- **Animations:** Motion (Framer Motion)
- **Forms:** React Hook Form, Zod
- **3D:** Three.js, React Three Fiber
- **Registry:** shadcn/ui

## License

MIT
