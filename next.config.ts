import type { NextConfig } from "next";
import { DEFAULT_GUIDE_SLUG, guideHref } from "./src/config/docs";
import { SITE_CONFIG } from "./src/lib/site-config";

const nextConfig: NextConfig = {
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
