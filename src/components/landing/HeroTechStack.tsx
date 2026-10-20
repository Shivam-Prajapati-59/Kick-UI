import React from "react";
import { heroConfig } from "@/config/landing/Hero";

const HeroTechStack = () => {
  const { techStack } = heroConfig;

  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm lg:justify-start">
      {techStack.map((tech, index) => {
        const Icon = tech.icon;

        return (
          <React.Fragment key={tech.name}>
            <li className="flex items-center gap-2">
              <Icon className="size-5 shrink-0" />
              <span className="text-foreground font-medium">{tech.name}</span>
              <span className="text-muted-foreground">{tech.version}</span>
            </li>
            {index < techStack.length - 1 && (
              <li
                aria-hidden
                className="bg-muted-foreground/50 size-1 rounded-full"
              />
            )}
          </React.Fragment>
        );
      })}
    </ul>
  );
};

export default HeroTechStack;
