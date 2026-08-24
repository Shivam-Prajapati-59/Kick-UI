import React from "react";
import { cn } from "@/lib/utils";

export default function Container({
  children,
  className,
  wide,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        wide ? "mx-auto w-full max-w-[1800px] px-2" : "container mx-auto px-4",
        "animate-fade-in-blur",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
