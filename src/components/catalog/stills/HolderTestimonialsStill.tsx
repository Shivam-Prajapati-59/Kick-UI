// Static catalog thumbnail: mirrors the holder testimonials tabs without motion.
const PALETTE = ["#e9e2d4", "#2f4a3f", "#c6b9e2", "#f0c65c"];

export function HolderTestimonialsStill() {
  return (
    <div
      className="flex size-full items-center justify-center gap-2 p-3"
      aria-hidden="true"
    >
      <div
        className="h-[96px] w-[150px] rounded-2xl"
        style={{ background: "#d9714a" }}
      />
      {PALETTE.map((color, i) => (
        <div
          key={i}
          className="h-[96px] w-[22px] rounded-2xl"
          style={{ background: color }}
        />
      ))}
    </div>
  );
}
