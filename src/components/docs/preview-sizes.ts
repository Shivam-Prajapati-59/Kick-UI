export type PreviewViewport = "desktop" | "tablet" | "mobile";

// Reserve space before an iframe loads so its content never changes the
// height of the component page after the preview becomes visible.
const previewHeights: Record<string, Partial<Record<PreviewViewport, number>>> = {
  "animated-list": { desktop: 480, tablet: 480, mobile: 470 },
  "card-stack": { desktop: 580, tablet: 580, mobile: 560 },
  "feature-showcase": { desktop: 1300, tablet: 1300, mobile: 700 },
  "pill-card": { desktop: 540, tablet: 540, mobile: 520 },
  "pixel-image": { desktop: 600, tablet: 600, mobile: 420 },
  "perspective-grid": { desktop: 780, tablet: 780, mobile: 760 },
  "trading-chart": { desktop: 600, tablet: 650, mobile: 720 },
};

export function getPreviewHeight(
  slug: string,
  viewport: PreviewViewport,
  fullPreview: boolean,
) {
  if (fullPreview) return 640;
  return previewHeights[slug]?.[viewport] ?? 350;
}
