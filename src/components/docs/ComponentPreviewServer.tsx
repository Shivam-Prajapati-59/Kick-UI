import { DemoRenderer } from "./DemoRenderer";

export function ComponentPreviewServer({ name }: { name: string }) {
  return <DemoRenderer name={name} />;
}
