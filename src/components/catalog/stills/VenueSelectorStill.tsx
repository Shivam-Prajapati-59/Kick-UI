import { Check, ChevronDown } from "lucide-react";

export function VenueSelectorStill() {
  return (
    <div
      className="flex size-full items-center justify-center p-3"
      aria-hidden="true"
    >
      <div className="border-border bg-card w-full max-w-[250px] overflow-hidden rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <span className="flex -space-x-1.5">
            <span className="ring-card bg-primary/20 text-primary flex size-5 items-center justify-center rounded-full text-[9px] font-bold ring-2">
              H
            </span>
            <span className="ring-card bg-secondary text-foreground flex size-5 items-center justify-center rounded-full text-[9px] font-bold ring-2">
              L
            </span>
          </span>
          <span className="text-foreground flex-1 text-xs font-medium">
            2 venues selected
          </span>
          <ChevronDown className="text-muted-foreground size-3.5" />
        </div>
        <div className="border-border space-y-1 border-t p-1.5">
          {[
            { name: "Hyperliquid", initial: "H" },
            { name: "Lighter", initial: "L" },
          ].map((venue) => (
            <div
              key={venue.name}
              className="bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1.5"
            >
              <span className="bg-background text-foreground flex size-[17px] items-center justify-center rounded-full text-[9px] font-bold">
                {venue.initial}
              </span>
              <span className="text-foreground flex-1 text-[11px]">
                {venue.name}
              </span>
              <Check className="text-primary size-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
