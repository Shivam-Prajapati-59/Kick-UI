import type { Metadata } from "next";
import GuidePage from "@/components/docs/GuidePage";
import { getGuidePage, guideHref } from "@/config/docs";

const page = getGuidePage("tailwind-css");

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: guideHref(page.slug),
  },
};

export default function InstallTailwindPage() {
  return <GuidePage slug="tailwind-css" />;
}
