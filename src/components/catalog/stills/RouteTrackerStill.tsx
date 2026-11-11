// Static catalog thumbnail: mirrors the route tracker's layout without motion.
export function RouteTrackerStill() {
  return (
    <div
      className="flex size-full items-center justify-center p-3"
      aria-hidden="true"
    >
      <div className="bg-card grid w-full max-w-[240px] grid-cols-[1fr_auto] gap-2.5 rounded-2xl border p-2.5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <span className="size-5 rounded-full bg-[#a6ec8f]" />
            <span className="bg-foreground/80 h-1.5 w-12 rounded-full" />
          </div>
          <div className="flex flex-col gap-1.5 rounded-xl bg-[#b0a2f6] p-2">
            {[0, 1, 2].map((r) => (
              <div
                key={r}
                className={`flex items-center gap-1 ${r % 2 ? "flex-row-reverse" : ""}`}
              >
                <span className="size-3.5 rounded-full bg-white" />
                <span
                  className={`h-px flex-1 ${r === 0 ? "bg-neutral-950" : "bg-neutral-950/30"}`}
                />
                <span className="size-3.5 rounded-full bg-white" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between py-0.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1">
              <span
                className={`size-2 rounded-full border ${i === 0 ? "border-foreground bg-foreground" : i === 1 ? "border-foreground bg-[#a6ec8f]" : "border-border"}`}
              />
              <span className="bg-muted-foreground/50 h-1 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
