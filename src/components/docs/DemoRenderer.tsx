"use client";

import { Suspense } from "react";
import { demos, type DemoName } from "@/generated/demo-map";

export type { DemoName };

export function DemoRenderer({ name }: { name: string }) {
  const Demo = demos[name as DemoName];
  if (!Demo) return null;
  // Demos use React.lazy, not next/dynamic: dynamic puts its lazy child in an
  // array, and React loses that array slot if the child suspends during
  // hydration, shifting every useId below it away from the server's value.
  return (
    <Suspense>
      <Demo />
    </Suspense>
  );
}
