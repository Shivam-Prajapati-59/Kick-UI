import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlaygroundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <p className="text-sm text-muted-foreground">
        Nothing here yet — drop the next experiment into this route.
      </p>
    </div>
  );
}
