import type { Metadata } from "next";
import TimeframeTabsDemo from "@/components/demo/Components/TimeframeTabs";

export const metadata: Metadata = {
  title: "Playground",
  robots: {
    index: false,
    follow: false,
  },
};

const page = () => {
  return (
    <div className="flex items-center justify-center">
      <TimeframeTabsDemo />
    </div>
  );
};

export default page;
