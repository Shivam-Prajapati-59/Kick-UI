import type { Metadata } from "next";
import { guideHref, type GuidePage } from "@/config/docs";
import { SITE_CONFIG } from "@/lib/site-config";

export function guideMetadata(page: GuidePage): Metadata {
  const url = `${SITE_CONFIG.url}${guideHref(page.slug)}`;
  const title = `${page.title} | ${SITE_CONFIG.name}`;
  const image = `${SITE_CONFIG.url}/og-image.png`;

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_CONFIG.name,
      title,
      description: page.description,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.description,
      images: [image],
    },
  };
}
