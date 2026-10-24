import GuidePage from "@/components/docs/GuidePage";
import { getGuidePage } from "@/config/docs";
import { guideMetadata } from "@/lib/guide-metadata";

const page = getGuidePage("cli");

export const metadata = guideMetadata(page);

export default function CliPage() {
  return <GuidePage slug="cli" />;
}
