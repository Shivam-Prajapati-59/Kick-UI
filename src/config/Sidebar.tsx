// types
export interface SidebarItem {
    title: string
    slug: string
    category: "components" | "animations" | "backgrounds"
    badge?: string
}

export const TextAnimations = {
    // "split-text": () => import("../demo/Animations/SplitTextDemo"),
    // "blur-text": () => import("../demo/Animations/BlurTextDemo"),
    // "circular-text": () => import("../demo/Animations/CircularTextDemo"),
    // "text-type": () => import("../demo/Animations/TextTypeDemo"),
    // "shuffle": () => import("../demo/Animations/ShuffleTextDemo"),
    // "shiny-text": () => import("../demo/Animations/ShinyTextDemo"),
    // "text-pressure": () => import("../demo/Animations/TextPressureDemo"),
    // "curved-loop": () => import("../demo/Animations/CurvedLoopDemo"),
    // "fuzzy-text": () => import("../demo/Animations/FuzzyTextDemo"),
    // "gradient-text": () => import("../demo/Animations/GradientTextDemo"),
    // "falling-text": () => import("../demo/Animations/FallingTextDemo"),
}

export const components = {
    // "shiny-button": () => import("../demo/Components/ShinyButtonDemo"),
    // "glow-card": () => import("../demo/Components/GlowCardDemo"),
    // "hover-border-card": () => import("../demo/Components/HoverBorderCardDemo"),
    // "magnetic-button": () => import("../demo/Components/MagneticButtonDemo"),
}

export const animations = {
    // "fade-in": () => import("../demo/Animations/FadeInDemo"),
    // "slide-up": () => import("../demo/Animations/SlideUpDemo"),
    // "parallax-scroll": () => import("../demo/Animations/ParallaxScrollDemo"),
}

export const backgrounds = {
    // "gradient-mesh": () => import("../demo/Backgrounds/GradientMeshDemo"),
    // "aurora-bg": () => import("../demo/Backgrounds/AuroraBackgroundDemo"),
    // "stars-bg": () => import("../demo/Backgrounds/StarsBackgroundDemo"),
}