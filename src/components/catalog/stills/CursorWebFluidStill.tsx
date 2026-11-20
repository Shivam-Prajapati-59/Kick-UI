export function CursorWebFluidStill() {
  return (
    <div className="size-full p-4" aria-hidden="true">
      <div className="bg-muted/40 relative size-full overflow-hidden rounded-md">
        <div className="absolute top-[15%] left-[8%] h-24 w-36 -rotate-12 rounded-full bg-violet-500/50 blur-2xl" />
        <div className="absolute top-[35%] left-[35%] h-20 w-40 rotate-12 rounded-full bg-fuchsia-500/50 blur-2xl" />
        <div className="absolute top-[20%] right-[8%] h-24 w-32 -rotate-12 rounded-full bg-cyan-400/40 blur-2xl" />

        <div className="relative flex size-full items-center justify-center">
          <span className="text-foreground text-lg font-semibold">
            Cursor Web Fluid
          </span>
        </div>
      </div>
    </div>
  );
}
