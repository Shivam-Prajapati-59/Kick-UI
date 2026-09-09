import type { Metadata } from "next";
import GuidePage from "@/components/docs/GuidePage";
import { getGuidePage, guideHref } from "@/config/docs";

const page = getGuidePage("cli");

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: guideHref(page.slug),
  },
};

export default function CliPage() {
  return <GuidePage slug="cli" />;
}
