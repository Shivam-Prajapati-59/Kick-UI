import type { NextConfig } from "next";
import { DEFAULT_GUIDE_SLUG, guideHref } from "./src/config/docs";

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
    return [
      {
        source: "/docs",
        destination: guideHref(DEFAULT_GUIDE_SLUG),
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
