import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/site-config";

export const alt = `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0a050f 0%, #16091f 55%, #241033 100%)",
        color: "#f5f0fa",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          marginBottom: 36,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 52,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          K
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -2 }}>
          Kick UI
        </div>
      </div>

      <div style={{ fontSize: 34, color: "#c4b5fd", marginBottom: 44 }}>
        {SITE_CONFIG.tagline}
      </div>

      <div style={{ display: "flex", gap: 18 }}>
        {["Accessible", "Customizable", "Open Source"].map((tag) => (
          <div
            key={tag}
            style={{
              padding: "10px 26px",
              borderRadius: 999,
              border: "1px solid rgba(196, 181, 253, 0.35)",
              fontSize: 22,
              color: "#e9d5ff",
            }}
          >
            {tag}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 40,
          fontSize: 22,
          color: "#8b7ba8",
          display: "flex",
          gap: 24,
        }}
      >
        <span>kick-ui.vercel.app</span>
        <span>·</span>
        <span>npx shadcn add @kick-ui</span>
      </div>
    </div>,
    { ...size },
  );
}
