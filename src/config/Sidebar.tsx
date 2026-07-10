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
            { label: "Card Stack", slug: "card-stack", enabled: true },
            { label: "Shiny Button", slug: "shiny-button", enabled: true },
            { label: "Slide Text Button", slug: "slide-text-button", enabled: true },
            { label: "Animated List", slug: "animated-list", enabled: true },
            { label: "Glow Card", slug: "glow-card", enabled: false },
            { label: "Hover Border Card", slug: "hover-border-card", enabled: false },
            { label: "Magnetic Button", slug: "magnetic-button", enabled: false },
        ],
    },
    {
        title: "Text Animations",
        basePath: "/components",
        items: [
            { label: "Scramble Text", slug: "scramble-text", enabled: true },
            { label: "Text Focus", slug: "text-focus", enabled: true },
            { label: "Split Text", slug: "split-text", enabled: false },
            { label: "Blur Text", slug: "blur-text", enabled: false },
            { label: "Circular Text", slug: "circular-text", enabled: false },
            { label: "Shiny Text", slug: "shiny-text", enabled: false },
            { label: "Text Pressure", slug: "text-pressure", enabled: false },
            { label: "Gradient Text", slug: "gradient-text", enabled: false },
            { label: "Fuzzy Text", slug: "fuzzy-text", enabled: false },
            { label: "Falling Text", slug: "falling-text", enabled: false },
            { label: "Shuffle Text", slug: "shuffle", enabled: false },
        ],
    },
    {
        title: "Animations",
        basePath: "/components",
        items: [
            { label: "Cursor WebFluid", slug: "cursor-web-fluid", enabled: true },
            { label: "Fade In", slug: "fade-in", enabled: false },
            { label: "Slide Up", slug: "slide-up", enabled: false },
            { label: "Parallax Scroll", slug: "parallax-scroll", enabled: false },
        ],
    },
    {
        title: "Backgrounds",
        basePath: "/components",
        items: [
            { label: "Gradient Mesh", slug: "gradient-mesh", enabled: false },
            { label: "Aurora", slug: "aurora-bg", enabled: false },
            { label: "Stars", slug: "stars-bg", enabled: false },
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
