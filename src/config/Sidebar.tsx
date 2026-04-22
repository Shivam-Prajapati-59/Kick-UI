// ─── Types ───────────────────────────────────────────────────────────────────

export interface SidebarItem {
    label: string;
    slug: string;
    enabled: boolean;
}

export interface SidebarCategory {
    /** Display title (rendered as the section header) */
    title: string;
    /** Route segment — items link to `/components/{item.slug}` */
    basePath: string;
    items: SidebarItem[];
}

// ─── Sidebar Data ────────────────────────────────────────────────────────────

export const sidebarCategories: SidebarCategory[] = [
    {
        title: "Components",
        basePath: "/components",
        items: [
            { label: "Shinny Button", slug: "shinny-button", enabled: true },
            { label: "Glow Card", slug: "glow-card", enabled: true },
            { label: "Hover Border Card", slug: "hover-border-card", enabled: true },
            { label: "Magnetic Button", slug: "magnetic-button", enabled: true },
        ],
    },
    {
        title: "Text Animations",
        basePath: "/components",
        items: [
            { label: "Split Text", slug: "split-text", enabled: true },
            { label: "Blur Text", slug: "blur-text", enabled: true },
            { label: "Circular Text", slug: "circular-text", enabled: true },
            { label: "Shiny Text", slug: "shiny-text", enabled: true },
            { label: "Text Pressure", slug: "text-pressure", enabled: true },
            { label: "Gradient Text", slug: "gradient-text", enabled: true },
            { label: "Fuzzy Text", slug: "fuzzy-text", enabled: true },
            { label: "Falling Text", slug: "falling-text", enabled: true },
            { label: "Shuffle Text", slug: "shuffle", enabled: true },
        ],
    },
    {
        title: "Animations",
        basePath: "/components",
        items: [
            { label: "Fade In", slug: "fade-in", enabled: true },
            { label: "Slide Up", slug: "slide-up", enabled: true },
            { label: "Parallax Scroll", slug: "parallax-scroll", enabled: true },
        ],
    },
    {
        title: "Backgrounds",
        basePath: "/components",
        items: [
            { label: "Gradient Mesh", slug: "gradient-mesh", enabled: true },
            { label: "Aurora", slug: "aurora-bg", enabled: true },
            { label: "Stars", slug: "stars-bg", enabled: true },
        ],
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns only categories that have at least one enabled item */
export function getActiveCategories() {
    return sidebarCategories.filter((cat) => cat.items.some((item) => item.enabled));
}

/** Returns all categories, including empty ones */
export function getAllCategories() {
    return sidebarCategories;
}