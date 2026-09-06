"use client";

import { demos, type DemoName } from "@/generated/demo-map";

export type { DemoName };

export function DemoRenderer({ name }: { name: string }) {
  const Demo = demos[name as DemoName];
  if (!Demo) return null;
  return <Demo />;
}
