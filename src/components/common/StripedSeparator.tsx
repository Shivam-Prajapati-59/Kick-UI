import { cn } from "@/lib/utils";

interface StripedSeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function StripedSeparator({
  orientation = "horizontal",
  className,
}: StripedSeparatorProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "select-none",
        "bg-[repeating-linear-gradient(-45deg,var(--border)_0px,var(--border)_1px,transparent_1px,transparent_8px)]",
        orientation === "horizontal"
          ? "border-border h-5 w-full border-y"
          : "border-border h-full w-7 border-x",
        className,
      )}
    />
  );
}

export default StripedSeparator;
