import Image from "next/image";
import { Copy, X } from "lucide-react";

export function DepositModalStill() {
  return (
    <div
      className="flex size-full items-center justify-center p-3"
      aria-hidden="true"
    >
      <div className="border-border bg-card w-full max-w-[260px] overflow-hidden rounded-xl border shadow-sm">
        <div className="border-border flex items-start justify-between border-b px-3 py-2">
          <div>
            <p className="text-foreground text-sm font-semibold">
              Deposit USDC
            </p>
            <p className="text-muted-foreground text-[11px]">
              Send USDC on Solana
            </p>
          </div>
          <X className="text-muted-foreground size-3.5" />
        </div>

        <div className="flex items-center justify-between gap-2 px-3 py-3">
          <div>
            <p className="text-muted-foreground text-[10px]">
              Amount to deposit
            </p>
            <p className="text-foreground text-lg font-semibold">
              125.00 <span className="text-xs font-medium">USDC</span>
            </p>
          </div>
          <span className="bg-secondary text-foreground flex items-center gap-1 rounded-full px-2 py-1 text-[11px]">
            <Image
              src="/assets/chains/solana.png"
              alt=""
              width={14}
              height={14}
            />
            Solana
          </span>
        </div>

        <div className="border-border bg-muted/40 border-t px-3 py-2">
          <p className="text-muted-foreground text-[10px]">Deposit address</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-foreground truncate font-mono text-[11px]">
              4usmCo6F...xa5mh
            </p>
            <Copy className="text-muted-foreground size-3.5 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
