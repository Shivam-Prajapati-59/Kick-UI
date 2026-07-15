"use client";

import PixelImage from "@registry/new-york/components/pixel-image/pixel-image";

export default function PixelImageDemo() {
  return (
    <PixelImage
      defaultImage="/assets/trafalgar.jpg"
      hoverImage="/assets/trafalgar1.jpg"
    />
  );
}
