import { ShieldCheck, Wallet } from "lucide-react";

export function FeatureShowcaseStill() {
  return (
    <div className="flex size-full items-center justify-center gap-4 overflow-hidden px-4" aria-hidden="true">
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Wallet features</p>
        <div className="border-border bg-secondary flex items-center gap-2 rounded-lg border px-2 py-2">
          <Wallet className="size-4 shrink-0 text-primary" />
          <span className="truncate text-[11px] font-semibold text-foreground">Wallets & Signing</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0" />
          <span className="truncate text-[11px]">Policy Engine</span>
        </div>
      </div>
      <div className="border-foreground/70 bg-background relative h-[145px] w-[94px] shrink-0 rounded-[19px] border-[3px] p-2 shadow-md">
        <span className="bg-foreground/70 absolute top-1 left-1/2 h-1 w-7 -translate-x-1/2 rounded-full" />
        <p className="mt-4 text-[9px] font-semibold text-foreground">My Wallet</p>
        <p className="mt-1 text-[15px] font-bold text-foreground">$620.58</p>
        <div className="mt-3 flex justify-between gap-1">
          {["Send", "Buy", "Receive"].map((action) => (
            <span key={action} className="bg-secondary size-5 rounded-full border border-border" />
          ))}
        </div>
        <div className="bg-muted/70 mt-4 h-7 rounded-lg" />
      </div>
    </div>
  );
}
