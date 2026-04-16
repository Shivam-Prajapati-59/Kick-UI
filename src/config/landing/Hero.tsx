import ReactIcon from "@/components/svgs/frameworks/React";
import NextJsIcon from "@/components/svgs/frameworks/NextJs";
import TailwindCss from "@/components/svgs/libraries/TailwindCss";
import Motion from "@/components/svgs/libraries/Motion";
import ShadcnIcon from "@/components/svgs/libraries/ShadcnIcon";

export const heroConfig = {
    badgeText: "Introducing new AI Agent Template",

    title: {
        line1: "Your Ultimate UI Library For",
        line2: "Designing Faster. Shipping Smarter.",
    },

    description:
        "100+ beautifully crafted, modern UI components built with Tailwind CSS, shadcn/ui, and Motion—ready to power your next website or product.",

    cta: {
        primary: {
            label: "Browse Components",
            href: "/components",
        },
        secondary: {
            label: "View Templates",
            href: "/templates",
        },
    },

    techStack: [
        {
            name: "Next.js",
            icon: NextJsIcon,
        },
        {
            name: "React",
            icon: ReactIcon,
        },
        {
            name: "Tailwind CSS",
            icon: TailwindCss,
        },
        {
            name: "shadcn/ui",
            icon: ShadcnIcon,
        },
        {
            name: "Motion",
            icon: Motion,
        },
    ],
} as const;
