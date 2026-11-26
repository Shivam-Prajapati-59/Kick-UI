import { ArrowLeft, ArrowRight } from "lucide-react";
import { FeatureArt } from "@registry/new-york/components/vault-carousel/vault-art";

const FEATURES = [
  { kind: "shield-lock" as const },
  { kind: "fingerprint" as const },
  { kind: "multisig" as const },
  { kind: "face-id" as const },
];

const CHIPS = ["All layers", "Custody", "Identity", "Keys"];

export function VaultCarouselStill() {
  return (
    <div className="flex size-full flex-col gap-2" aria-hidden="true">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground flex items-center gap-1.5 text-[8px]">
          <span className="size-1.5 rounded-full bg-[#1490f7]" />
          Security stack
        </p>
        <h2 className="text-[13px] leading-tight font-normal tracking-tight">
          Every key, guarded twice
        </h2>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            {CHIPS.map((chip, i) => (
              <span
                key={chip}
                className={
                  i === 0
                    ? "rounded-full border border-transparent bg-[#111111] px-1.5 py-0.5 text-[9px] font-medium whitespace-nowrap text-[#f4f6f9] dark:bg-neutral-100 dark:text-neutral-950"
                    : "text-muted-foreground rounded-full border border-[rgba(17,17,17,0.14)] px-1.5 py-0.5 text-[9px] font-medium whitespace-nowrap dark:border-white/15"
                }
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-muted-foreground min-w-7 text-right text-[8px] tabular-nums">
              01 / 08
            </span>
            <span className="text-muted-foreground grid size-5 place-items-center rounded-full border border-[rgba(17,17,17,0.14)] dark:border-white/15">
              <ArrowLeft className="size-2.5" />
            </span>
            <span className="text-muted-foreground grid size-5 place-items-center rounded-full border border-[rgba(17,17,17,0.14)] dark:border-white/15">
              <ArrowRight className="size-2.5" />
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-hidden">
        {FEATURES.map((feature) => (
          <div
            key={feature.kind}
            className="relative h-[104px] w-[86px] shrink-0 overflow-hidden rounded-2xl bg-[#f1efe9] dark:bg-[#262b37]"
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.95),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_42%,rgba(96,140,210,0.34),transparent_62%)]"
            />
            <div className="absolute inset-0 p-2">
              <FeatureArt
                kind={feature.kind}
                drawn
                live={false}
                onScreen
                motionAllowed={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
