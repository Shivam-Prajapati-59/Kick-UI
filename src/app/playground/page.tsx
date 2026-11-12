import type { Metadata } from "next";
import GuardCarousel from "./GuardCarousel";

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
      <GuardCarousel />
    </div>
  );
}
