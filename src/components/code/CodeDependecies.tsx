"use client";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface CodeDependenciesProps {
  /** List of dependency names (e.g. ["motion", "clsx"]) */
  dependencies: string[];
  /** Additional CSS classes */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CodeDependencies({
  dependencies = [],
  className,
}: CodeDependenciesProps) {
  if (dependencies.length === 0) return null;

  return (
    <div className={cn("mt-8", className)}>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Dependencies
      </h3>
      <div className="flex flex-wrap gap-2">
        {dependencies.map((dep) => (
          <a
            key={dep}
            href={`https://www.npmjs.com/package/${dep}`}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
              "border border-border bg-muted/50 text-muted-foreground",
              "transition-colors hover:bg-muted hover:text-foreground"
            )}
          >
            {dep}
          </a>
        ))}
      </div>
    </div>
  );
}
