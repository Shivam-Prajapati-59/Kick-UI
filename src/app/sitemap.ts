import type { MetadataRoute } from "next";
import { componentIndex } from "@/generated/component-index";
import { guideHref, guideSections } from "@/config/docs";
import { SITE_CONFIG } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  // No lastModified: we don't track real content-modification timestamps,
  // and fabricated `new Date()` values erode crawler trust in the signal.
  // `/playground` is deliberately excluded: it serves `noindex`, and a
  // sitemap must list only URLs intended for indexing.
  const staticRoutes = ["", "/components"].map((route) => ({
    url: `${SITE_CONFIG.url}${route}`,
  }));

  const componentRoutes = componentIndex.map((component) => ({
    url: `${SITE_CONFIG.url}/components/${component.slug}`,
  }));

  const guideRoutes = guideSections
    .flatMap((section) => section.pages)
    .map((page) => ({
      url: `${SITE_CONFIG.url}${guideHref(page.slug)}`,
    }));

  return [...staticRoutes, ...componentRoutes, ...guideRoutes];
}
