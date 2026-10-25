import PixelImageDemo from "@/demos/pixel-image";
import Image from "next/image";

export function PixelImageStill() {
  return (
    <div className="flex size-full items-center justify-center p-3" aria-hidden="true">
      <div className="border-border relative h-[170px] w-full max-w-full overflow-hidden rounded-3xl border">
        <PixelImageDemo />
      </div>
    </div>
  );
}
