import { ImageResponse } from "next/og";
import { componentIndex } from "@/generated/component-index";
import { getCategoryMetadata } from "@/lib/component-categories";
import { SITE_HOST } from "@/lib/site-config";

export const alt = "Kick UI animated React component";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export async function generateStaticParams() {
  return componentIndex.map((component) => ({ slug: component.slug }));
}

// Clamp long descriptions so they wrap to roughly two lines on the card.
const MAX_DESCRIPTION_LENGTH = 120;

function clampDescription(description: string) {
  if (description.length <= MAX_DESCRIPTION_LENGTH) {
    return description;
  }
  const words: string[] = [];
  for (const word of description.split(" ")) {
    const candidate = words.length ? `${words.join(" ")} ${word}` : word;
    if (candidate.length > MAX_DESCRIPTION_LENGTH) break;
    words.push(word);
  }
  return `${words.join(" ").replace(/[,;:\s]+$/, "")}…`;
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const component = componentIndex.find((item) => item.slug === slug);

  const title = component?.title ?? "Kick UI";
  const description = component ? clampDescription(component.description) : "";
  const category = component
    ? getCategoryMetadata(component.category).label
    : "";

  return new ImageResponse(
    <div
      style={{
        background: "#0a050f",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "70px 80px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#c4b5fd" }}>
          Kick UI
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#fafafa",
            marginTop: 28,
          }}
        >
          {title}
        </div>
        {description ? (
          <div style={{ fontSize: 30, color: "#ddd6fe", marginTop: 24 }}>
            {description}
          </div>
        ) : null}
        {category ? (
          <div style={{ fontSize: 24, color: "#a78bfa", marginTop: 24 }}>
            {category}
          </div>
        ) : null}
      </div>
      <div style={{ fontSize: 24, color: "#8b7aa8" }}>{SITE_HOST}</div>
    </div>,
    { ...size },
  );
}
