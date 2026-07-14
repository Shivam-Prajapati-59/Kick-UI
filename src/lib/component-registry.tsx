import React from "react";
import { ShinyButton } from "@/components/demo/Components/ShinyButton";
import CursorWebFluidDemo from "@/components/demo/Animations/CursorWebFluid/CursorWebFluidDemo";
import ScrambleText from "@/components/demo/TextAnimations/ScrambleText";
import TextFocus from "@/components/demo/TextAnimations/TextFocus";
import CardStack from "@/components/demo/Components/CardStack";
import AnimatedListDemo from "@/components/demo/Components/AnimatedList";
import SlideTextButton from "@/components/demo/Components/SlideTextButton";
import PerspectiveGrid from "@/components/demo/Components/PerspectiveGrid";
import MagDockDemo from "@/components/demo/Components/MagDock";
import type { ComponentRegistryItem, PropItem } from "@/lib/types";
export type { ComponentRegistryItem, PropItem };

export const componentRegistry: ComponentRegistryItem[] = [
  {
    name: "Shiny Button",
    slug: "shiny-button",
    description: "A button with a smooth shiny animation effect.",
    category: "Buttons",
    dependencies: ["motion"],
    registryDependencies: ["button"],
    installCommand:
      "npx shadcn@latest add https://kick-ui.vercel.app/r/shiny-button.json",
    sourceFilename: "components/ui/shiny-button.tsx",
    usage: `import { ShinyButton } from "@/components/ui/shiny-button";

export default function Example() {
  return <ShinyButton>Shiny Button</ShinyButton>;
}`,
    preview: <ShinyButton>Shiny Button</ShinyButton>,
    propsData: [
      {
        name: "shimmerWidth",
        type: "number",
        default: "-",
        description: "Width of the shimmer effect.",
      },
      {
        name: "duration",
        type: "number",
        default: "2",
        description: "Duration of one animation cycle in seconds.",
      },
      {
        name: "className",
        type: "string",
        default: "''",
        description: "Adds custom classes to the root element.",
      },
    ],
  },
  {
    name: "Cursor WebFluid",
    slug: "cursor-web-fluid",
    description:
      "A mesmerizing WebGL fluid simulation that follows your cursor with ink-like trails. Fully customizable via props.",
    category: "Animations",
    dependencies: ["three"],
    registryDependencies: [],
    installCommand:
      "npx shadcn@latest add https://kick-ui.vercel.app/r/cursor-web-fluid.json",
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
      {
        name: "inkColor",
        type: "string",
        default: '"--foreground"',
        description:
          'CSS variable (e.g. "--primary") or any CSS color ("#ff0080"). Resolved at runtime so it respects light/dark mode.',
      },
      {
        name: "blendMode",
        type: 'CSSProperties["mixBlendMode"]',
        default: '"difference"',
        description:
          'CSS mix-blend-mode on the canvas. Use "difference" for theme-aware trails, "normal" for opaque ink.',
      },
      {
        name: "contained",
        type: "boolean",
        default: "false",
        description:
          "When true, canvas fills its nearest positioned parent (absolute) instead of the full viewport (fixed).",
      },
      {
        name: "simResolution",
        type: "number",
        default: "256",
        description:
          "Velocity simulation grid resolution. Higher = more detail, lower = better performance.",
      },
      {
        name: "dyeResolution",
        type: "number",
        default: "1024",
        description: "Dye (ink) texture resolution.",
      },
      {
        name: "curl",
        type: "number",
        default: "25",
        description: "Curl/vorticity strength — how much the fluid spins.",
      },
      {
        name: "pressureIterations",
        type: "number",
        default: "50",
        description: "Number of pressure solver iterations per frame.",
      },
      {
        name: "velocityDissipation",
        type: "number",
        default: "0.95",
        description:
          "How quickly velocity fades (0–1). Closer to 1 = longer trails.",
      },
      {
        name: "dyeDissipation",
        type: "number",
        default: "0.95",
        description:
          "How quickly ink fades (0–1). Closer to 1 = ink stays longer.",
      },
      {
        name: "splatRadius",
        type: "number",
        default: "0.275",
        description: "Radius of the cursor splat effect.",
      },
      {
        name: "forceStrength",
        type: "number",
        default: "7.5",
        description:
          "Multiplier for cursor velocity force applied to the fluid.",
      },
      {
        name: "pressureDecay",
        type: "number",
        default: "0.75",
        description: "Pressure retained each frame (0–1).",
      },
      {
        name: "threshold",
        type: "number",
        default: "1.0",
        description: "Display threshold for ink rendering.",
      },
      {
        name: "edgeSoftness",
        type: "number",
        default: "0.0",
        description: "Edge feathering of ink (0 = sharp, >0 = soft).",
      },
      {
        name: "zIndex",
        type: "number",
        default: "100",
        description: "z-index of the canvas overlay.",
      },
      {
        name: "className",
        type: "string",
        default: "''",
        description: "Extra class names on the canvas element.",
      },
      {
        name: "style",
        type: "CSSProperties",
        default: "—",
        description: "Extra inline styles forwarded to the canvas element.",
      },
    ],
    fullPreview: true,
  },
  {
    name: "Scramble Text",
    slug: "scramble-text",
    description:
      "A hover-driven text scramble animation with a smooth decode sweep.",
    category: "Text Animations",
    dependencies: ["motion"],
    registryDependencies: [],
    installCommand:
      "npx shadcn@latest add https://kick-ui.vercel.app/r/scramble-text.json",
    sourceFilename: "components/ui/scramble-text.tsx",
    usage: `import ScrambleText from "@/components/ui/scramble-text";

export default function Example() {
  return <ScrambleText text="Shivam" />;
}`,
    preview: <ScrambleText text="Shivam" />,
    propsData: [
      {
        name: "text",
        type: "string",
        default: "—",
        description: "The text to animate and reveal on hover.",
      },
      {
        name: "href",
        type: "string",
        default: '"#"',
        description: "Optional link target for the text wrapper.",
      },
    ],
  },
  {
    name: "Text Focus",
    slug: "text-focus",
    description:
      "A Text animation that sharpens one hovered word while softly blurring the rest.",
    category: "Text Animations",
    dependencies: ["motion"],
    registryDependencies: [],
    installCommand:
      "npx shadcn@latest add https://kick-ui.vercel.app/r/text-focus.json",
    sourceFilename: "components/ui/text-focus.tsx",
    usage: `import TextFocus from "@/components/ui/text-focus";

export default function Example() {
  return <TextFocus sentence="All Eyes on Me" borderColor="#22d3ee" blurAmount={3} />;
}`,
    preview: (
      <TextFocus
        sentence="All Eyes on Me"
        borderColor="#22d3ee"
        blurAmount={3}
      />
    ),
    propsData: [
      {
        name: "sentence",
        type: "string",
        default: '"All Eyes on Me"',
        description: "Sentence split into words for the focus effect.",
      },
      {
        name: "borderColor",
        type: "string",
        default: '"#22d3ee"',
        description: "Border color for the animated focus frame.",
      },
      {
        name: "blurAmount",
        type: "number",
        default: "3",
        description: "Blur strength applied to non-focused words.",
      },
    ],
  },
  {
    name: "Card Stack",
    slug: "card-stack",
    description:
      "An elegant, interactive stack of cards that smoothly fans out into a parabolic arc.",
    category: "Components",
    dependencies: ["motion"],
    registryDependencies: [],
    installCommand:
      "npx shadcn@latest add https://kick-ui.vercel.app/r/card-stack.json",
    sourceFilename: "components/ui/card-stack.tsx",
    usage: `import CardStack from "@/components/ui/card-stack";

export default function Example() {
  return (
    <div className="w-full h-[400px]">
      <CardStack />
    </div>
  );
}`,
    preview: <CardStack />,
    propsData: [
      {
        name: "items",
        type: "CardItem[]",
        default: "cryptoCards",
        description:
          "Array of cards to display, containing id, name, image, and position.",
      },
      {
        name: "openDelay",
        type: "number",
        default: "600",
        description: "Delay in ms before the stack fans out.",
      },
      {
        name: "settleDelay",
        type: "number",
        default: "500",
        description:
          "Delay in ms after opening before hover states become active instantly.",
      },
      {
        name: "hoverOffset",
        type: "number",
        default: "-20",
        description: "Y-axis offset when a card is hovered.",
      },
      {
        name: "className",
        type: "string",
        default: "''",
        description: "Additional classes for the container section.",
      },
      {
        name: "cardClassName",
        type: "string",
        default: "''",
        description: "Additional classes for individual cards.",
      },
    ],
    fullPreview: true,
  },
  {
    name: "Slide Text Button",
    slug: "slide-text-button",
    description:
      "A button with a smooth slide-up text animation and an expanding circle background on hover.",
    category: "Buttons",
    dependencies: ["motion"],
    registryDependencies: [],
    installCommand:
      "npx shadcn@latest add https://kick-ui.vercel.app/r/slide-text-button.json",
    sourceFilename: "components/ui/slide-text-button.tsx",
    usage: `import SlideTextButton from "@/components/ui/slide-text-button";

export default function Example() {
  return (
    <SlideTextButton
      initialText={<span>Hi</span>}
      hoverText={<span>Bye</span>}
    />
  );
}`,
    preview: <SlideTextButton />,
    propsData: [
      {
        name: "initialText",
        type: "React.ReactNode",
        default: "Discord icon",
        description: "Content shown before hover.",
      },
      {
        name: "hoverText",
        type: "React.ReactNode",
        default: "Discord icon",
        description: "Content shown on hover after sliding up.",
      },
      {
        name: "className",
        type: "string",
        default: "''",
        description: "Additional classes for the button element.",
      },
    ],
  },
  {
    name: "Perspective Grid",
    slug: "perspective-grid",
    description:
      "A 3D-perspective grid of blockchain logos that tilt on hover with a spring animation.",
    category: "Components",
    dependencies: ["motion"],
    registryDependencies: [],
    installCommand:
      "npx shadcn@latest add https://kick-ui.vercel.app/r/perspective-grid.json",
    sourceFilename: "components/ui/perspective-grid.tsx",
    usage: `import PerspectiveGrid from "@/components/ui/perspective-grid";

export default function Example() {
  return <PerspectiveGrid />;
}`,
    preview: <PerspectiveGrid />,
    propsData: [
      {
        name: "chains",
        type: "Chain[]",
        default: "24 default chains",
        description:
          "Array of chain objects with id, name, symbol, and optional logo URL.",
      },
      {
        name: "title",
        type: "ReactNode",
        default:
          '"Any transaction on any chain,\\<br /\\>Aside executes it for you."',
        description:
          "Heading text below the subtitle. Use <br /> for line breaks.",
      },
      {
        name: "subtitle",
        type: "ReactNode",
        default: '"Multi-chain ecosystem"',
        description: "Small accent text above the title.",
      },
      {
        name: "className",
        type: "string",
        default: "''",
        description: "Additional classes for the root section.",
      },
      {
        name: "gridClassName",
        type: "string",
        default: "''",
        description: "Additional classes for the grid container.",
      },
    ],
  },
  {
    name: "MagDock",
    slug: "mag-dock",
    description:
      "A macOS-style dock with spring-animated icon scaling, lift on hover, tooltips, and active-state indicators.",
    category: "Components",
    dependencies: ["motion"],
    registryDependencies: [],
    installCommand:
      "npx shadcn@latest add https://kick-ui.vercel.app/r/mag-dock.json",
    sourceFilename: "components/ui/mag-dock.tsx",
    usage: `import MagDock from "@/components/ui/mag-dock";
import { HomeIcon, MailIcon } from "lucide-react";

const items = [
  { id: 1, icon: HomeIcon, name: "Home", active: true },
  { id: 2, icon: MailIcon, name: "Mail", active: true },
];

export default function Example() {
  return <MagDock items={items} />;
}`,
    preview: <MagDockDemo />,
    propsData: [
      {
        name: "items",
        type: "MagDockItem[]",
        default: "—",
        description:
          "Array of dock items with id, icon component, name, and optional active state.",
      },
      {
        name: "className",
        type: "string",
        default: "''",
        description: "Additional classes for the root wrapper.",
      },
    ],
  },
  {
    name: "Animated List",
    slug: "animated-list",
    description:
      "A generic, performant animated list with keyboard navigation, auto-scroll, and dynamic fade gradients.",
    category: "Components",
    dependencies: ["motion"],
    registryDependencies: [],
    installCommand:
      "bunx shadcn@latest add https://kick-ui.vercel.app/r/animated-list.json",
    sourceFilename: "components/ui/animated-list.tsx",
    usage: `import { AnimatedList } from "@/components/ui/animated-list";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function Example() {
  const items = ["Item 1", "Item 2", "Item 3", "Item 4"];
  return (
    <AnimatedList
      items={items}
      renderItem={(item, index, isSelected, onMouseEnter, onClick, listRef) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2, root: listRef }}
          className={cn(
            "p-4 mb-2 rounded-lg cursor-pointer transition-colors border",
            isSelected ? "bg-accent border-accent" : "bg-card border-border hover:bg-accent/50"
          )}
          onMouseEnter={onMouseEnter}
          onClick={onClick}
          data-index={index}
        >
          {item}
        </motion.div>
      )}
    />
  );
}`,
    preview: <AnimatedListDemo />,
    propsData: [
      {
        name: "items",
        type: "T[]",
        default: "-",
        description: "An array of items to render in the list.",
      },
      {
        name: "renderItem",
        type: "Function",
        default: "-",
        description:
          "A render prop function to render each item. Receives item data, index, selected state, interaction handlers, and the scroll container ref.",
      },
      {
        name: "className",
        type: "string",
        default: "''",
        description: "Custom class names applied to the container.",
      },
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
