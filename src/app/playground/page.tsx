import type { Metadata } from "next";
import FooterWordmark from "@/components/svgs/brand/FooterWordmark";

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
      <FooterWordmark text="Kick UI" />
    </div>
  );
}
