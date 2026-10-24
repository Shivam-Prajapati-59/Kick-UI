import GuidePage from "@/components/docs/GuidePage";
import { getGuidePage } from "@/config/docs";
import { guideMetadata } from "@/lib/guide-metadata";

const page = getGuidePage("tailwind-css");

export const metadata = guideMetadata(page);

export default function InstallTailwindPage() {
  return <GuidePage slug="tailwind-css" />;
}
