export function CursorWebFluidStill() {
  return (
    <div className="relative size-full" aria-hidden="true">
      <div className="flex size-full flex-col items-center justify-center gap-1 pr-14">
        <p className="text-foreground text-base font-extrabold tracking-tight">
          Move your cursor here
        </p>
        <p className="text-muted-foreground text-[10px]">
          Experience the WebGL Fluid
        </p>
      </div>
      <svg
        className="text-foreground pointer-events-none absolute top-1/2 right-[4%] h-28 w-10 -translate-y-1/2"
        viewBox="0 0 40 100"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 92 C 14 70, 18 45, 32 8"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M8 92 C 14 70, 18 45, 32 8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}
