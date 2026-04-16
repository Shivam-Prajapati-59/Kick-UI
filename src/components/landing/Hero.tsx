"use client";

import Container from "../common/Container";
import { Button } from "../ui/button";
import IntroduceText from "../custom/IntroduceText";
import { heroConfig } from "@/config/landing/Hero";
import Link from "next/link";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const Hero = () => {
    const { badgeText, title, description, cta, techStack } = heroConfig;

    return (
        <Container>
            <section className="flex flex-col items-center text-center gap-8 py-20">
                {/* Intro Badge */}
                <IntroduceText text={badgeText} />

                {/* Hero Text */}
                <div className="max-w-3xl space-y-4">
                    <h1 className="text-3xl md:text-5xl font-light leading-tight">
                        <span className="block">{title.line1}</span>
                        <span className="block font-medium md:text-6xl">{title.line2}</span>
                    </h1>
                    <p className="text-muted-foreground text-base md:text-lg">
                        {description}
                    </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button>
                        <Link href={cta.primary.href}>{cta.primary.label}</Link>
                    </Button>
                    <Button variant="outline">
                        <Link href={cta.secondary.href}>{cta.secondary.label}</Link>
                    </Button>
                </div>

                {/* Tech Stack with Tooltips & Animations */}
                <TooltipProvider delayDuration={200}>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        {techStack.map((tech) => {
                            const Icon = tech.icon;

                            return (
                                <Tooltip key={tech.name}>
                                    <TooltipTrigger asChild>
                                        <div className="group cursor-pointer p-2 transition-all duration-300 ease-in-out hover:scale-125">
                                            {/* CHANGED: Increased size to h-8 w-8 */}
                                            <Icon className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                                        </div>
                                    </TooltipTrigger>
                                    {/* CHANGED: Direction set to "top" */}
                                    <TooltipContent side="top" className="font-medium">
                                        <p>{tech.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </TooltipProvider>

            </section>
        </Container>
    );
};

export default Hero;