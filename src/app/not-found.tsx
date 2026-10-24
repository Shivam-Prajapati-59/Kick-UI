import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Chrome sweep for the big "404": grey → white → grey → white down the
 * glyphs, so the number reads as brushed metal instead of flat text. Inline
 * rather than a Tailwind arbitrary value because the stops are long enough to
 * be unreadable (and unverifiable) inside a class name.
 */
const CHROME_IMAGE =
  "linear-gradient(180deg, #b0b0b0 0%, #ffffff 26%, #7a7a7a 52%, #ededed 76%, #ffffff 90%, #9a9a9a 100%)";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100svh-var(--navbar-height))] flex-col items-center justify-center px-6 py-24 text-center">
      {/* Decorative: the accessible name comes from the h1 below. */}
      <p
        aria-hidden
        style={{ backgroundImage: CHROME_IMAGE }}
        className="bg-clip-text text-[clamp(6.5rem,24vw,16rem)] leading-[0.82] font-black tracking-tighter text-transparent drop-shadow-[0_10px_50px_rgba(255,255,255,0.08)]"
      >
        404
      </p>

      <h1 className="mt-10 text-2xl font-bold tracking-tight">
        Page not found
      </h1>

      <p className="text-muted-foreground mx-auto mt-3 max-w-[26rem] text-base text-balance">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button
          asChild
          className="bg-foreground text-background hover:bg-foreground/90 h-11 rounded-md px-6"
        >
          <Link href="/">
            <ArrowLeft />
            Go back home
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-border/70 hover:bg-secondary/60 h-11 rounded-md bg-transparent px-6 dark:bg-transparent"
        >
          <Link href="/components">
            Browse components
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
