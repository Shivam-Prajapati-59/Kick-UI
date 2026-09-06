"use client";

import FeatureShowcase, {
  defaultFeatureItems,
} from "@registry/new-york/components/feature-showcase/feature-showcase";

export default function FeatureShowcaseDemo() {
  return (
    <FeatureShowcase
      items={defaultFeatureItems}
      title={"Easily deploy, maintain,\nand connect wallets"}
      subtitle="Launch embedded wallets in under 7 minutes."
    />
  );
}
