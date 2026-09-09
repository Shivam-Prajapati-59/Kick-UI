import type { Metadata } from "next";
import GuidePage from "@/components/docs/GuidePage";
import { getGuidePage, guideHref } from "@/config/docs";

const page = getGuidePage("utilities");

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: guideHref(page.slug),
  },
};

export default function AddUtilitiesPage() {
  return <GuidePage slug="utilities" />;
}
