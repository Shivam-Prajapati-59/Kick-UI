import type { Metadata } from "next";
import VaultCarouselDemo from "@/demos/vault-carousel";

export const metadata: Metadata = {
  title: "Playground",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlaygroundPage() {
  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      <VaultCarouselDemo />
    </div>
  );
}
