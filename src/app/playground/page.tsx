import type { Metadata } from "next";
import { VenueSelector } from "./VenueSelector";

export const metadata: Metadata = {
  title: "Playground",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlaygroundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <VenueSelector />
    </div>
  );
}
