import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
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

// Load a non-woff2 Geist font from node_modules for real bold rendering.
// Only Geist-Regular.ttf is available locally (single weight), so it is
// registered for both 400 and 700. If the file is missing, skip font loading.
let geistFontData: Buffer | null = null;
try {
  geistFontData = await readFile(
    join(
      process.cwd(),
      "node_modules",
      "next",
      "dist",
      "compiled",
      "@vercel",
      "og",
      "Geist-Regular.ttf",
    ),
  );
} catch {
  geistFontData = null;
}

const imageFonts:
  | Array<{
      name: string;
      data: Buffer;
      weight: 400 | 700;
      style: "normal";
    }>
  | undefined = geistFontData
  ? [
      {
        name: "Geist",
        data: geistFontData,
        weight: 400,
        style: "normal",
      },
      {
        name: "Geist",
        data: geistFontData,
        weight: 700,
        style: "normal",
      },
    ]
  : undefined;

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

  // Load the captured component screenshot from the filesystem (build/request time).
  let screenshotSrc: string | null = null;
  try {
    const data = await readFile(
      join(process.cwd(), "public", "og", "components", `${slug}.jpg`),
      "base64",
    );
    screenshotSrc = `data:image/jpeg;base64,${data}`;
  } catch {
    screenshotSrc = null;
  }

  // Fallback: original text-only design when no screenshot exists.
  if (!screenshotSrc) {
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
          fontFamily: "Geist",
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
      { ...size, fonts: imageFonts },
    );
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0a050f",
        fontFamily: "Geist",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        src={screenshotSrc}
        style={{
          width: 1200,
          height: 470,
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
      <div
        style={{
          height: 160,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#0a050f",
          borderTop: "1px solid rgba(196,181,253,0.18)",
          padding: "0 64px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 52, color: "#fafafa", fontWeight: 700 }}>
            {title}
          </div>
          {category ? (
            <div style={{ fontSize: 24, color: "#a78bfa" }}>{category}</div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div style={{ fontSize: 28, color: "#c4b5fd", fontWeight: 700 }}>
            Kick UI
          </div>
          <div style={{ fontSize: 20, color: "#a1a1aa" }}>kickui.xyz</div>
        </div>
      </div>
    </div>,
    { ...size, fonts: imageFonts },
  );
}
