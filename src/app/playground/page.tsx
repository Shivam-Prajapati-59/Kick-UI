import type { Metadata } from "next";
import HolderTestimonialsDemo from "@/demos/holder-testimonials";

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
      <HolderTestimonialsDemo />
    </div>
  );
}
