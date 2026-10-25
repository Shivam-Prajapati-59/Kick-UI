export function CursorWebFluidStill() {
    return (
        <div
            className="bg-muted/40 relative size-full overflow-hidden"
            aria-hidden="true"
        >
            <div className="absolute left-[8%] top-[15%] h-24 w-36 -rotate-12 rounded-full bg-violet-500/50 blur-2xl" />
            <div className="absolute left-[35%] top-[35%] h-20 w-40 rotate-12 rounded-full bg-fuchsia-500/50 blur-2xl" />
            <div className="absolute right-[8%] top-[20%] h-24 w-32 -rotate-12 rounded-full bg-cyan-400/40 blur-2xl" />

            <div className="relative flex size-full items-center justify-center">
                <span className="text-foreground text-lg font-semibold">
                    Cursor Web Fluid
                </span>
            </div>
        </div>
    );
}