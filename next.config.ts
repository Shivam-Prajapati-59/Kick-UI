import type { NextConfig } from "next";
import { DEFAULT_GUIDE_SLUG, guideHref } from "./src/config/docs";
import { SITE_CONFIG } from "./src/lib/site-config";

const DOC_FILES = [
  "content/components/**/*",
  "registry.json",
  "registry/new-york/**/*",
];

const nextConfig: NextConfig = {
  devIndicators: false,
  // component-docs reads these at render time (including ISR revalidation);
  // the dynamic fs access is excluded from tracing, so include them explicitly.
  outputFileTracingIncludes: {
    "/components/[slug]": DOC_FILES,
    "/preview/[slug]": DOC_FILES,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    const legacyHosts = ["kick-ui.vercel.app", "kickui.xyz"];

    return [
      {
        source: "/docs",
        destination: guideHref(DEFAULT_GUIDE_SLUG),
        permanent: true,
      },
      ...legacyHosts.map((host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: `${SITE_CONFIG.url}/:path*`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
