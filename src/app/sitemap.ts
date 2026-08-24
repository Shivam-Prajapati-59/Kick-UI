import type { MetadataRoute } from "next";
import { componentIndex } from "@/generated/component-index";
import { SITE_CONFIG } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/components", "/docs", "/playground"].map(
    (route) => ({
      url: `${SITE_CONFIG.url}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    }),
  );

  const componentRoutes = componentIndex.map((component) => ({
    url: `${SITE_CONFIG.url}/components/${component.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...componentRoutes];
}
