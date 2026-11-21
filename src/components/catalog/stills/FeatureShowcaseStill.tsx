import { Search, ShieldCheck, Wallet } from "lucide-react";

export function FeatureShowcaseStill() {
  return (
    <div
      className="flex size-full items-center justify-center gap-4 overflow-hidden px-4"
      aria-hidden="true"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
          Wallet features
        </p>
        <div className="border-border bg-secondary flex items-center gap-2 rounded-lg border px-2 py-2">
          <Wallet className="text-primary size-4 shrink-0" />
          <span className="text-foreground truncate text-[11px] font-semibold">
            Wallets & Signing
          </span>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 px-2 py-1.5">
          <ShieldCheck className="size-4 shrink-0" />
          <span className="truncate text-[11px]">Policy Engine</span>
        </div>
      </div>
      <div className="border-foreground/70 bg-background relative h-[145px] w-[94px] shrink-0 rounded-[19px] border-[3px] p-2 shadow-md">
        <span className="bg-foreground/70 absolute top-1 left-1/2 h-1 w-7 -translate-x-1/2 rounded-full" />
        <div className="text-foreground/70 flex items-center justify-between text-[6px] leading-none">
          <span>9:41</span>
          <span>···</span>
        </div>
        <div className="border-border bg-muted text-muted-foreground mt-1 flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[7px] leading-none">
          <Search className="size-2 shrink-0" />
          Search
        </div>
        <p className="text-foreground mt-1.5 text-[11px] leading-none font-semibold">
          NFTs
        </p>
        <p className="text-muted-foreground mt-0.5 text-[8px] leading-none">
          Crypto Punks
        </p>
        <div className="mx-auto mt-1 grid w-[54px] grid-cols-2 gap-1">
          <span className="border-border bg-primary/30 aspect-square rounded-[5px] border" />
          <span className="border-border bg-muted aspect-square rounded-[5px] border" />
          <span className="border-border aspect-square rounded-[5px] border bg-linear-to-br from-violet-400/60 to-fuchsia-400/40" />
          <span className="border-border aspect-square rounded-[5px] border bg-linear-to-br from-sky-400/50 to-cyan-400/40" />
        </div>
      </div>
    </div>
  );
}
