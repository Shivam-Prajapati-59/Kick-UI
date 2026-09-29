import type { Metadata } from "next";
import DepositDemo from "./DepositDemo";

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
      <DepositDemo />
    </div>
  );
}
