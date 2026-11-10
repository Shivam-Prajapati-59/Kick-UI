// Static catalog thumbnail: mirrors the glyph card's layout without the canvas.
export function GlyphCardStill() {
  return (
    <div
      className="flex size-full items-center justify-center p-3"
      aria-hidden="true"
    >
      <div className="relative flex aspect-[340/230] w-full max-w-[220px] flex-col overflow-hidden rounded-[20px] bg-[#ece4fe] p-2.5 text-neutral-950 ring-2 ring-white/60 ring-inset">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-[repeating-linear-gradient(90deg,#b39af5_0_6px,#9b7bf0_6px_12px)] [mask-image:linear-gradient(90deg,#000_40%,transparent)] opacity-80" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(#8b65ec_1px,transparent_1.2px)] bg-[length:5px_5px] opacity-40" />
        <div className="relative flex items-center gap-1.5">
          <span className="size-4 rounded-full bg-white" />
          <span className="h-1.5 w-12 rounded-full bg-neutral-950/80" />
        </div>
        <p className="relative mt-1.5 text-2xl leading-none font-extrabold tracking-tight">
          $1,248
        </p>
        <div className="relative mt-auto flex gap-1">
          <span className="size-7 rounded-full bg-neutral-950" />
          <span className="h-7 flex-1 rounded-full bg-neutral-950" />
        </div>
      </div>
    </div>
  );
}
