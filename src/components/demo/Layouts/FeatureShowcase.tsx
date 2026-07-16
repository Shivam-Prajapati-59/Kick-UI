"use client";

import {
  ShieldCheck,
  Wallet,
  FileText,
  MousePointer,
} from "lucide-react";
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
        "flex flex-col lg:flex-row gap-6 lg:gap-8 w-full relative",
        className,
      )}
    >
      {/* ─── Left: Content ─────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-start z-10 py-2 lg:py-4">
        <div className="mb-8 lg:mb-10 max-w-xl">
          <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] xl:text-[48px] leading-[1.1] tracking-tight font-medium whitespace-pre-line">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[15px] sm:text-[16px] lg:text-[18px] text-muted-foreground mt-3 lg:mt-4">
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
                onClick={() => setActiveId(item.id)}
                className={cn(
                  "group flex items-start gap-4 lg:gap-5 p-5 lg:p-6 xl:p-8 rounded-lg transition-all text-left",
                  isActive
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground bg-transparent",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 transition-colors shrink-0",
                    isActive
                      ? activeColor
                      : "text-neutral-500 group-hover:text-foreground",
                  )}
                >
                  {item.icon}
                </div>
                <div className="flex flex-col items-start justify-start min-w-0">
                  <h3 className="text-[17px] lg:text-[20px] xl:text-[22px] font-medium leading-snug">
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
                        <p className="text-[14px] lg:text-[15px] xl:text-[16px] text-muted-foreground leading-relaxed mt-1">
                          {item.description}
                        </p>
                        {item.cta && (
                          <span
                            className={cn(
                              "font-medium mt-2 text-[14px] lg:text-[15px] block",
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
      <div className="hidden sm:block w-full lg:w-1/2 relative overflow-hidden h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute top-8 sm:top-10 lg:top-16 xl:top-20 w-full h-full flex justify-end"
          >
            <div className="relative w-auto h-full max-w-[85%] md:max-w-[80%] lg:max-w-[85%]">
              {activeItem && (
                <Image
                  src={activeItem.image}
                  alt={activeItem.title}
                  priority
                  width={450}
                  height={900}
                  className="w-full h-full object-contain object-top drop-shadow-2xl"
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
                  className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[22%] md:w-[25%] z-20"
                >
                  <Image
                    src={activeItem.overlayImage}
                    alt="Overlay"
                    width={100}
                    height={100}
                    className="w-full h-auto drop-shadow-2xl rounded-3xl md:rounded-4xl"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom gradient — feathered shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 md:h-40 lg:h-48 bg-linear-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
};

export { FeatureShowcase };
export default FeatureShowcase;
