import type { Metadata } from "next";
import FolderCard from "./FolderCard";

export const metadata: Metadata = {
  title: "Playground",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlaygroundPage() {
  return (
    <div className="bg-background flex min-h-screen flex-wrap items-center justify-center gap-[30px]"></div>
  );
}
