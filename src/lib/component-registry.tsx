import React from "react";
import { ShinyButton } from "@/components/demo/Components/ShinnyButton";
import CursorWebFluidDemo from "@/components/demo/Animations/CursorWebFluid/CursorWebFluidDemo";
import ScrambleText from "@/components/demo/TextAnimations/ScrambleText";
import TextFocus from "@/components/demo/TextAnimations/TextFocus";

export interface PropItem {
  name: string;
  type: string;
  default?: string;
  description?: string;
}

export interface ComponentRegistryItem {
  name: string;
  slug: string;
  description: string;
  category: string;
  dependencies: string[];
  registryDependencies: string[];
  installCommand: string;
  usage: string;
  /** File path shown above source code, e.g. "components/ui/shinny-button.tsx" */
  sourceFilename?: string;
  preview: React.ReactNode;
  propsData: PropItem[];
  /** When true, the preview container removes padding and min-height constraints */
  fullPreview?: boolean;
}

export const componentRegistry: ComponentRegistryItem[] = [
  {
    name: "Shiny Button",
    slug: "shinny-button",
    description: "A button with a smooth shiny animation effect.",
    category: "Buttons",
    dependencies: ["motion"],
    registryDependencies: ["button"],
    installCommand: "npx shadcn@latest add https://kick-ui.vercel.app/r/shinny-button.json",
    sourceFilename: "components/ui/shinny-button.tsx",
    usage: `import { ShinyButton } from "@/components/ui/shinny-button";

export default function Example() {
  return <ShinyButton>Shinny Button</ShinyButton>;
}`,
    preview: <ShinyButton>Shinny Button</ShinyButton>,
    propsData: [
      { name: "shimmerWidth", type: "number", default: "-", description: "Width of the shimmer effect." },
      { name: "duration", type: "number", default: "2", description: "Duration of one animation cycle in seconds." },
      { name: "className", type: "string", default: "''", description: "Adds custom classes to the root element." },
    ],
  },
  {
    name: "Cursor WebFluid",
    slug: "cursor-web-fluid",
    description: "A mesmerizing WebGL fluid simulation that follows your cursor with ink-like trails. Fully customizable via props.",
    category: "Animations",
    dependencies: ["three"],
    registryDependencies: [],
    installCommand: "npx shadcn@latest add https://kick-ui.vercel.app/r/cursor-web-fluid.json",
    sourceFilename: "components/ui/cursor-web-fluid.tsx",
    usage: `import CursorWebFluid from "@/components/ui/cursor-web-fluid";

export default function Example() {
  return (
    <>
      {/* Full-viewport overlay (fixed) */}
      <CursorWebFluid inkColor="--foreground" blendMode="difference" />

      {/* Contained inside a div */}
      <div className="relative h-64 w-full overflow-hidden rounded-xl">
        <CursorWebFluid contained inkColor="--primary" blendMode="normal" />
      </div>
    </>
  );
}`,
    preview: <CursorWebFluidDemo />,
    propsData: [
      { name: "inkColor", type: "string", default: '"--foreground"', description: 'CSS variable (e.g. "--primary") or any CSS color ("#ff0080"). Resolved at runtime so it respects light/dark mode.' },
      { name: "blendMode", type: "CSSProperties[\"mixBlendMode\"]", default: '"difference"', description: 'CSS mix-blend-mode on the canvas. Use "difference" for theme-aware trails, "normal" for opaque ink.' },
      { name: "contained", type: "boolean", default: "false", description: "When true, canvas fills its nearest positioned parent (absolute) instead of the full viewport (fixed)." },
      { name: "simResolution", type: "number", default: "256", description: "Velocity simulation grid resolution. Higher = more detail, lower = better performance." },
      { name: "dyeResolution", type: "number", default: "1024", description: "Dye (ink) texture resolution." },
      { name: "curl", type: "number", default: "25", description: "Curl/vorticity strength — how much the fluid spins." },
      { name: "pressureIterations", type: "number", default: "50", description: "Number of pressure solver iterations per frame." },
      { name: "velocityDissipation", type: "number", default: "0.95", description: "How quickly velocity fades (0–1). Closer to 1 = longer trails." },
      { name: "dyeDissipation", type: "number", default: "0.95", description: "How quickly ink fades (0–1). Closer to 1 = ink stays longer." },
      { name: "splatRadius", type: "number", default: "0.275", description: "Radius of the cursor splat effect." },
      { name: "forceStrength", type: "number", default: "7.5", description: "Multiplier for cursor velocity force applied to the fluid." },
      { name: "pressureDecay", type: "number", default: "0.75", description: "Pressure retained each frame (0–1)." },
      { name: "threshold", type: "number", default: "1.0", description: "Display threshold for ink rendering." },
      { name: "edgeSoftness", type: "number", default: "0.0", description: "Edge feathering of ink (0 = sharp, >0 = soft)." },
      { name: "zIndex", type: "number", default: "100", description: "z-index of the canvas overlay." },
      { name: "className", type: "string", default: "''", description: "Extra class names on the canvas element." },
      { name: "style", type: "CSSProperties", default: "—", description: "Extra inline styles forwarded to the canvas element." },
    ],
    fullPreview: true,
  },
  {
    name: "Scramble Text",
    slug: "scramble-text",
    description: "A hover-driven text scramble animation with a smooth decode sweep.",
    category: "Text Animations",
    dependencies: ["motion"],
    registryDependencies: [],
    installCommand: "npx shadcn@latest add https://kick-ui.vercel.app/r/scramble-text.json",
    sourceFilename: "components/ui/scramble-text.tsx",
    usage: `import ScrambleText from "@/components/ui/scramble-text";

export default function Example() {
  return <ScrambleText text="Shivam" />;
}`,
    preview: <ScrambleText text="Shivam" />,
    propsData: [
      { name: "text", type: "string", default: "—", description: "The text to animate and reveal on hover." },
      { name: "href", type: "string", default: '"#"', description: "Optional link target for the text wrapper." },
    ],
  },
  {
    name: "Text Focus",
    slug: "text-focus",
    description: "A text animation that sharpens one hovered word while softly blurring the rest.",
    category: "Text Animations",
    dependencies: ["motion"],
    registryDependencies: [],
    installCommand: "npx shadcn@latest add https://kick-ui.vercel.app/r/text-focus.json",
    sourceFilename: "components/ui/text-focus.tsx",
    usage: `import TextFocus from "@/components/ui/text-focus";

export default function Example() {
  return <TextFocus sentence="All Eyes on Me" borderColor="#22d3ee" blurAmount={3} />;
}`,
    preview: <TextFocus sentence="All Eyes on Me" borderColor="#22d3ee" blurAmount={3} />,
    propsData: [
      { name: "sentence", type: "string", default: '"All Eyes on Me"', description: "Sentence split into words for the focus effect." },
      { name: "borderColor", type: "string", default: '"#22d3ee"', description: "Border color for the animated focus frame." },
      { name: "blurAmount", type: "number", default: "3", description: "Blur strength applied to non-focused words." },
    ],
  },
];

export function getComponent(slug: string) {
  return componentRegistry.find((c) => c.slug === slug);
}

export function getAllComponents() {
  return componentRegistry;
}

export function getComponentsByCategory() {
  const grouped: Record<string, ComponentRegistryItem[]> = {};
  for (const component of componentRegistry) {
    if (!grouped[component.category]) grouped[component.category] = [];
    grouped[component.category].push(component);
  }
  return grouped;
}
