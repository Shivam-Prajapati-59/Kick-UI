import { ImageResponse } from "next/og";
import { getComponentDoc } from "@/lib/component-docs";
import { SITE_CONFIG } from "@/lib/site-config";

export const alt = "Component preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ComponentOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const component = getComponentDoc((await params).slug);
  const title = component?.title ?? "Component";
  const description = component?.description ?? SITE_CONFIG.description;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(135deg, #0a050f 0%, #16091f 55%, #241033 100%)",
        color: "#f5f0fa",
        fontFamily: "sans-serif",
        padding: 72,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          K
        </div>
        <div style={{ fontSize: 34, fontWeight: 600 }}>Kick UI</div>
        <div
          style={{
            marginLeft: "auto",
            fontSize: 22,
            color: "#8b7ba8",
            border: "1px solid rgba(196, 181, 253, 0.3)",
            borderRadius: 999,
            padding: "8px 20px",
          }}
        >
          shadcn registry
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: -2,
            marginBottom: 18,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 30, color: "#c4b5fd", maxWidth: 900 }}>
          {description}
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 24, color: "#8b7ba8" }}>
        kick-ui.vercel.app/components/{component?.slug ?? ""}
      </div>
    </div>,
    { ...size },
  );
}
