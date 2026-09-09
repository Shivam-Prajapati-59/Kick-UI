import type { Metadata } from "next";
import GuidePage from "@/components/docs/GuidePage";
import { getGuidePage, guideHref } from "@/config/docs";

const page = getGuidePage("nextjs");

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: guideHref(page.slug),
  },
};

export default function InstallNextJsPage() {
  return <GuidePage slug="nextjs" />;
}
