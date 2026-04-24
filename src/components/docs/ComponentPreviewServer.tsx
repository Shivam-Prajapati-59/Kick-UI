import { ComponentPreviewClient } from "./ComponentPreviewClient";

// Server wrapper that can be used inside MDX (rendered by next-mdx-remote)
// It simply delegates to the client component
export function ComponentPreviewServer({ name }: { name: string }) {
  return <ComponentPreviewClient slug={name} />;
}
