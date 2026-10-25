import { Database, Monitor, Radio, ShieldCheck, Wallet } from "lucide-react";

const icons = [Monitor, Wallet, ShieldCheck, Database];

export function PillCardStill() {
    return (
        <div className="flex size-full items-center justify-center p-3" aria-hidden="true">
            <div className="relative h-[165px] w-full max-w-[290px] overflow-hidden rounded-xl border border-border bg-card">
                <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-foreground">
                    <Radio className="size-3.5 text-primary" />
                    rpc : mainnet-1
                </div>

                <svg
                    className="absolute inset-0 size-full text-primary/50"
                    viewBox="0 0 290 165"
                    fill="none"
                    aria-hidden="true"
                >
                    <path d="M145 42 C145 75 67 70 67 105" stroke="currentColor" />
                    <path d="M145 42 C145 75 119 70 119 105" stroke="currentColor" />
                    <path d="M145 42 C145 75 171 70 171 105" stroke="currentColor" />
                    <path d="M145 42 C145 75 223 70 223 105" stroke="currentColor" />
                </svg>

                <div className="absolute inset-x-0 top-[88px] flex justify-center gap-4">
                    {icons.map((Icon, index) => (
                        <div
                            key={index}
                            className="flex size-9 items-center justify-center rounded-lg border border-border bg-secondary text-foreground"
                        >
                            <Icon className="size-4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}