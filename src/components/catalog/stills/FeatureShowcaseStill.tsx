import { ShieldCheck, Wallet } from "lucide-react";

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
        <p className="text-foreground mt-4 text-[9px] font-semibold">
          My Wallet
        </p>
        <p className="text-foreground mt-1 text-[15px] font-bold">$620.58</p>
        <div className="mt-3 flex justify-between gap-1">
          {["Send", "Buy", "Receive"].map((action) => (
            <span
              key={action}
              className="bg-secondary border-border size-5 rounded-full border"
            />
          ))}
        </div>
        <div className="bg-muted/70 mt-4 h-7 rounded-lg" />
      </div>
    </div>
  );
}
