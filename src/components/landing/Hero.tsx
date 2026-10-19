"use client";

import { Button } from "../ui/button";
import { ShaderBackground } from "../ui/shader-background";
import Web3Hero from "./Web3HeroIllustration";
import Container from "../common/Container";
import IntroduceText from "../custom/IntroduceText";
import { heroConfig } from "@/config/landing/Hero";
import { Download } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Hero = () => {
  const {
    badgeLabel,
    badgeText,
    badgeHref,
    title,
    description,
    cta,
    techStack,
  } = heroConfig;

  return (
    <section className="relative isolate -mt-(--navbar-height) overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mask-[linear-gradient(to_bottom,black_0%,black_74%,transparent_100%)] opacity-90 dark:opacity-80"
      >
        <ShaderBackground className="absolute inset-0 h-full w-full" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, var(--background) 0%, transparent 10%, transparent 90%, var(--background) 100%), linear-gradient(to bottom, transparent 0%, transparent 74%, var(--background) 100%)",
          }}
        />
      </div>

      <Container className="relative z-10 flex min-h-[calc(112svh-var(--navbar-height))] flex-col justify-center pt-[calc(var(--navbar-height)+5rem)] pb-20 text-center lg:text-left">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col items-center gap-8 lg:items-start">
            {/* Intro Badge — centered on mobile, left on lg */}
            <div className="flex w-full justify-center lg:justify-start">
              <IntroduceText
                text={badgeText}
                badge={badgeLabel}
                href={badgeHref}
              />
            </div>

            {/* Hero Text */}
            <div className="max-w-3xl space-y-4">
              <h1 className="text-3xl leading-tight font-light md:text-5xl">
                <span className="block">{title.line1}</span>
                <span className="block font-medium md:text-6xl">
                  {title.line2}
                </span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                {description}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild>
                <Link href={cta.primary.href}>{cta.primary.label}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={cta.secondary.href}>
                  <Download className="size-4" />
                  {cta.secondary.label}
                </Link>
              </Button>
            </div>

            {/* Tech Stack with Tooltips & Animations */}
            <TooltipProvider delayDuration={200}>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 lg:justify-start">
                {techStack.map((tech) => {
                  const Icon = tech.icon;

                  return (
                    <Tooltip key={tech.name}>
                      <TooltipTrigger asChild>
                        <div className="group cursor-pointer p-2 transition-all duration-300 ease-in-out hover:scale-125">
                          {/* CHANGED: Increased size to h-8 w-8 */}
                          <Icon className="text-muted-foreground group-hover:text-primary h-8 w-8 transition-colors" />
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
          </div>
          {/* Isometric web3 illustration */}
          <div className="relative mx-auto w-full max-w-[680px]">
            <Web3Hero background={false} className="h-auto w-full" />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
