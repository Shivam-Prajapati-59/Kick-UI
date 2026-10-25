"use client";

import type { MouseEvent, ReactNode } from "react";
import { Link, useTransitionRouter } from "next-view-transitions";

type ComponentCatalogCardProps = {
  slug: string;
  title: string;
  description: string;
  preview: ReactNode;
  interactivePreview: boolean;
};

export function ComponentCatalogCard({
  slug,
  title,
  description,
  preview,
  interactivePreview,
}: ComponentCatalogCardProps) {
  const router = useTransitionRouter();
  const href = `/components/${slug}`;

  function handleCardClick(event: MouseEvent<HTMLElement>) {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) return;

    // Links and controls handle their own clicks. Live demos stay interactive.
    if (
      target.closest(
        "a, button, input, select, textarea, [role='button'], [data-interactive-preview]",
      )
    ) {
      return;
    }

    router.push(href);
  }

  return (
    <article
      onClick={handleCardClick}
      className="group flex h-full min-h-[300px] cursor-pointer flex-col overflow-hidden rounded-[28px] border border-border/60 bg-card transition-colors hover:border-foreground/60 focus-within:border-foreground/60 focus-within:ring-2 focus-within:ring-ring"
    >
      <div
        className="relative flex h-[190px] w-full items-center justify-center overflow-hidden pt-4"
        data-interactive-preview={interactivePreview ? "" : undefined}
      >
        {preview}
      </div>

      <div className="mt-auto space-y-2 px-5 pb-6">
        <h3 className="text-base font-semibold">
          <Link
            href={href}
            className="rounded-sm focus-visible:outline-none"
          >
            {title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </article>
  );
}