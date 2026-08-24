"use client";

import { ShieldCheck, Wallet, FileText, MousePointer } from "lucide-react";
import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FeatureShowcaseItem {
  id: number;
  title: string;
  description: string;
  /** A React node rendered as the row icon (e.g. a Lucide icon component) */
  icon: ReactNode;
  href?: string;
  cta?: string;
  /** Path or URL to the main mockup image for this item */
  image: string;
  /** Optional overlay image (e.g. a face-id badge) displayed on top of the mockup */
  overlayImage?: string;
}

export interface FeatureShowcaseProps {
  items?: FeatureShowcaseItem[];
  title?: string;
  subtitle?: string;
  /** The initially active item id (defaults to items[0].id) */
  defaultActiveId?: number;
  /** Tailwind color class for the active accent (default: "text-blue-600") */
  activeColor?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Default data                                                       */
/* ------------------------------------------------------------------ */

const defaultImages: Record<number, string> = {
  1: "/assets/images/feature-showcase/iphone_authentication.png",
  2: "/assets/images/feature-showcase/iphone_wallets.png",
  3: "/assets/images/feature-showcase/iphone_policy.png",
  4: "/assets/images/feature-showcase/iphone_sessions.png",
};

export const defaultFeatureItems: FeatureShowcaseItem[] = [
  {
    id: 1,
    title: "Authentication",
    description:
      "Onboard users faster with familiar login and authentication methods, like OAuth, passkeys (biometrics, PINs, etc), email, and more.",
    icon: <ShieldCheck strokeWidth={1.5} size={24} />,
    href: "/authentication",
    cta: "Learn more",
    image: defaultImages[1],
    overlayImage: "/assets/images/feature-showcase/smile.webp",
  },
  {
    id: 2,
    title: "Wallets & Signing",
    description:
      "Manage crypto wallets, transactions, signatures, and wallet connections.",
    icon: <Wallet strokeWidth={1.5} size={24} />,
    href: "/wallets",
    cta: "Learn more",
    image: defaultImages[2],
  },
  {
    id: 3,
    title: "Policy Engine",
    description:
      "Create and manage security policies, permissions, and access controls.",
    icon: <FileText strokeWidth={1.5} size={24} />,
    href: "/policy-engine",
    cta: "Learn more",
    image: defaultImages[3],
  },
  {
    id: 4,
    title: "Sessions",
    description: "Monitor user sessions, devices, and authentication activity.",
    icon: <MousePointer strokeWidth={1.5} size={24} />,
    href: "/sessions",
    cta: "Learn more",
    image: defaultImages[4],
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const FeatureShowcase = ({
  items = defaultFeatureItems,
  title = "Easily deploy, maintain,\nand connect wallets\nacross your product stack",
  subtitle = "Launch embedded wallets in under 7 minutes.",
  defaultActiveId,
  activeColor = "text-blue-600",
  className,
}: FeatureShowcaseProps) => {
  const [activeId, setActiveId] = useState(
    defaultActiveId ?? (items.length > 0 ? items[0].id : 1),
  );

  const activeItem = items.find((item) => item.id === activeId);

  return (
    <div
      className={cn(
        "relative flex w-full flex-col gap-6 lg:flex-row lg:gap-8",
        className,
      )}
    >
      {/* ─── Left: Content ─────────────────────────── */}
      <div className="z-10 flex w-full flex-col justify-start py-2 lg:w-1/2 lg:py-4">
        <div className="mb-8 max-w-xl lg:mb-10">
          <h2 className="text-[28px] leading-[1.1] font-medium tracking-tight whitespace-pre-line sm:text-[36px] lg:text-[42px] xl:text-[48px]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground mt-3 text-[15px] sm:text-[16px] lg:mt-4 lg:text-[18px]">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                aria-expanded={isActive}
                className={cn(
                  "group focus-visible:ring-ring focus-visible:ring-offset-background flex items-start gap-4 rounded-lg p-5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 lg:gap-5 lg:p-6 xl:p-8",
                  isActive
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground bg-transparent",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 shrink-0 transition-colors",
                    isActive
                      ? activeColor
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {item.icon}
                </div>
                <div className="flex min-w-0 flex-col items-start justify-start">
                  <h3 className="text-[17px] leading-snug font-medium lg:text-[20px] xl:text-[22px]">
                    {item.title}
                  </h3>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 6 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-muted-foreground mt-1 text-[14px] leading-relaxed lg:text-[15px] xl:text-[16px]">
                          {item.description}
                        </p>
                        {item.cta && (
                          <span
                            className={cn(
                              "mt-2 block text-[14px] font-medium lg:text-[15px]",
                              activeColor,
                            )}
                          >
                            {item.cta}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Right: Phone mockup ──────────────────── */}
      <div className="relative hidden h-[400px] w-full overflow-hidden sm:block sm:h-[500px] md:h-[600px] lg:h-[700px] lg:w-1/2 xl:h-[800px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute top-8 flex h-full w-full justify-end sm:top-10 lg:top-16 xl:top-20"
          >
            <div className="relative h-full w-auto max-w-[85%] md:max-w-[80%] lg:max-w-[85%]">
              {activeItem && (
                <Image
                  src={activeItem.image}
                  alt={activeItem.title}
                  priority
                  width={450}
                  height={900}
                  className="h-full w-full object-contain object-top drop-shadow-2xl"
                />
              )}
              {activeItem?.overlayImage && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                  className="absolute top-[10%] left-1/2 z-20 w-[22%] -translate-x-1/2 md:w-[25%]"
                >
                  <Image
                    src={activeItem.overlayImage}
                    alt=""
                    width={100}
                    height={100}
                    className="h-auto w-full rounded-3xl drop-shadow-2xl md:rounded-4xl"
                    unoptimized
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom gradient — feathered shadow */}
        <div className="from-background via-background/80 pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-32 bg-linear-to-t to-transparent md:h-40 lg:h-48" />
      </div>
    </div>
  );
};

export { FeatureShowcase };
export default FeatureShowcase;
