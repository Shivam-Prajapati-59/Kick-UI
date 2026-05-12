import React from "react";

const items = [
    {
        id: "01",
        title: "Browse",
        description:
            "Explore beautifully crafted components and modern UI patterns for your next project.",
        className:
            "md:col-span-2 md:row-span-3 md:col-start-1 md:row-start-1",
    },
    {
        id: "02",
        title: "Install",
        description:
            "Add components instantly with a simple CLI command directly into your app.",
        className:
            "md:col-span-2 md:row-span-3 md:col-start-3 md:row-start-1",
        code: "npx shadcn@latest add kick-ui/button",
    },
    {
        id: "03",
        title: "Build Faster",
        description:
            "Craft stunning interfaces with reusable sections, blocks, and animations.",
        className:
            "md:col-span-4 md:row-span-5 md:col-start-1 md:row-start-4",
    },
    {
        id: "04",
        title: "Developer First",
        description:
            "Built with Tailwind, React, and shadcn/ui — fully customizable and production ready.",
        className:
            "md:col-span-4 md:row-span-5 md:col-start-5 md:row-start-1",
    },
    {
        id: "05",
        title: "Customize",
        description:
            "Edit styles, structure, and animations freely. No locked components or hidden logic.",
        className:
            "md:col-span-2 md:row-span-3 md:col-start-5 md:row-start-6",
    },
    {
        id: "06",
        title: "Responsive",
        description:
            "Carefully designed layouts that look perfect across desktop, tablet, and mobile.",
        className:
            "md:col-span-2 md:row-span-3 md:col-start-7 md:row-start-6",
    },
];

const LandingGrid = () => {
    return (
        <section className="w-full py-20">
            <div className="mx-auto max-w-7xl px-4">
                <div
                    className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            md:grid-cols-8
            md:grid-rows-8
            md:auto-rows-[80px]
          "
                >
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={`
                group
                relative
                flex
                min-h-[240px]
                flex-col
                justify-between
                overflow-hidden
                rounded-2xl
                border
                bg-card
                p-6
                text-card-foreground
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-lg

                ${item.className}
              `}
                        >
                            {/* subtle background pattern */}
                            <div
                                className="
                  absolute inset-0 opacity-[0.04]
                  bg-[linear-gradient(to_right,hsl(var(--foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground))_1px,transparent_1px)]
                  bg-[size:32px_32px]
                "
                            />

                            <div className="relative z-10">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {item.id}
                                </span>

                                <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                                    {item.title}
                                </h3>

                                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                                    {item.description}
                                </p>

                            </div>

                            <div className="relative z-10 mt-6 flex items-center gap-2">
                                <div className="size-2 rounded-full bg-primary" />

                                <span className="text-sm text-muted-foreground">
                                    Kick UI
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LandingGrid;