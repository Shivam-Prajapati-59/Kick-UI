import Image from "next/image";
import { Copy, X } from "lucide-react";

export function DepositModalStill() {
    return (
        <div className="flex size-full items-center justify-center p-3" aria-hidden="true">
            <div className="w-full max-w-[290px] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-start justify-between border-b border-border px-3 py-2">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Deposit USDC</p>
                        <p className="text-[11px] text-muted-foreground">
                            Send USDC on Solana
                        </p>
                    </div>
                    <X className="size-3.5 text-muted-foreground" />
                </div>

                <div className="flex items-center justify-between gap-2 px-3 py-3">
                    <div>
                        <p className="text-[10px] text-muted-foreground">Amount to deposit</p>
                        <p className="text-lg font-semibold text-foreground">
                            125.00 <span className="text-xs font-medium">USDC</span>
                        </p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[11px] text-foreground">
                        <Image src="/assets/chains/solana.png" alt="" width={14} height={14} />
                        Solana
                    </span>
                </div>

                <div className="border-t border-border bg-muted/40 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">Deposit address</p>
                    <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-mono text-[11px] text-foreground">
                            4usmCo6F...xa5mh
                        </p>
                        <Copy className="size-3.5 shrink-0 text-muted-foreground" />
                    </div>
                </div>
            </div>
        </div>
    );
}