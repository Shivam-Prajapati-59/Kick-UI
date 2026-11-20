import Image from "next/image";

export function ScrollCardStill() {
  return (
    <div
      className="flex size-full items-center gap-3 px-3 py-2"
      aria-hidden="true"
    >
      <div className="border-border bg-card relative h-[130px] w-[130px] shrink-0 overflow-hidden rounded-xl border shadow-sm">
        <Image
          src="/assets/dummy/Card1.png"
          alt=""
          fill
          unoptimized
          className="object-cover"
          sizes="130px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <div>
          <p className="text-foreground text-[11px] leading-tight font-semibold">
            Secure Wallet Infrastructure
          </p>
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-[9px] leading-snug">
            Embedded wallets with MPC-based key management and recovery.
          </p>
        </div>
        <p className="text-muted-foreground truncate text-[10px]">
          Passwordless Authentication
        </p>
        <p className="text-muted-foreground truncate text-[10px]">
          Developer-Friendly APIs
        </p>
        <p className="text-muted-foreground truncate text-[10px]">
          Enterprise-Grade Security
        </p>
      </div>
    </div>
  );
}
