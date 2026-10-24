import GuidePage from "@/components/docs/GuidePage";
import { getGuidePage } from "@/config/docs";
import { guideMetadata } from "@/lib/guide-metadata";

const page = getGuidePage("nextjs");

export const metadata = guideMetadata(page);

export default function InstallNextJsPage() {
  return <GuidePage slug="nextjs" />;
}
