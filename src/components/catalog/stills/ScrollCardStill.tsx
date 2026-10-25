import { ArrowUpRight, ShieldCheck, Wallet } from "lucide-react";

export function ScrollCardStill() {
  return (
    <div className="flex size-full items-center justify-center p-4" aria-hidden="true">
      <div className="relative h-[156px] w-full max-w-[280px]">
        <div className="border-border bg-muted absolute inset-x-4 top-6 h-[125px] rounded-xl border" />
        <div className="border-border bg-secondary absolute inset-x-2 top-3 h-[125px] rounded-xl border" />
        <div className="border-border bg-card absolute inset-x-0 top-0 flex h-[125px] flex-col justify-between rounded-xl border p-3 shadow-md">
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <Wallet className="size-4" />
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">Secure Wallet Infrastructure</p>
              <p className="text-muted-foreground mt-0.5 text-[10px]">Embedded wallets and recovery</p>
            </div>
            <ShieldCheck className="size-4 shrink-0 text-primary" />
          </div>
        </div>
        <ArrowUpRight className="text-muted-foreground absolute right-3 bottom-0 size-3.5" />
      </div>
    </div>
  );
}
