import type { Metadata } from "next";
import TradingChartDemo from "@/demos/trading-chart";

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
      <div className="w-full max-w-5xl">
        <TradingChartDemo />
      </div>
    </div>
  );
}
