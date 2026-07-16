"use client";
import {
  ShieldCheck,
  Wallet,
  FileText,
  MousePointer,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import iphoneAuth from "./iphone_authentication.png";
import iphoneWallets from "./iphone_wallets.png";
import iphonePolicy from "./iphone_policy.png";
import iphoneSessions from "./iphone_sessions.png";
import smileIcon from "./smile.webp";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type { StaticImageData } from "next/image";

const imageMap: Record<number, StaticImageData> = {
  1: iphoneAuth,
  2: iphoneWallets,
  3: iphonePolicy,
  4: iphoneSessions,
};

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  Wallet,
  FileText,
  MousePointer,
};

export const menuItems = [
  {
    id: 1,
    title: "Authentication",
    description:
      "Onboard users faster with familiar login and authentication methods, like OAuth, passkeys (biometrics, PINs, etc), email, and more.",
    icon: "ShieldCheck",
    href: "/authentication",
    cta: "Learn more",
    active: true,
  },
  {
    id: 2,
    title: "Wallets & Signing",
    description:
      "Manage crypto wallets, transactions, signatures, and wallet connections.",
    icon: "Wallet",
    href: "/wallets",
    cta: "Learn more",
    active: false,
  },
  {
    id: 3,
    title: "Policy Engine",
    description:
      "Create and manage security policies, permissions, and access controls.",
    icon: "FileText",
    href: "/policy-engine",
    cta: "Learn more",
    active: false,
  },
  {
    id: 4,
    title: "Sessions",
    description: "Monitor user sessions, devices, and authentication activity.",
    icon: "MousePointer",
    href: "/sessions",
    cta: "Learn more",
    active: false,
  },
];

const FeatureSection = () => {
  const [activeId, setActiveId] = useState(1);

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full h-full relative min-h-112.5 sm:min-h-137.5 lg:min-h-175 xl:min-h-200">
      {/* ─── Left: Content ─────────────────────────── */}
      <div className="flex-1 flex flex-col justify-start z-10 py-4 lg:py-2 overflow-y-auto">
        <div className="mb-10 max-w-xl">
          <h1 className="text-[36px] sm:text-[42px] lg:text-[48px] leading-[1.1] tracking-tight font-medium">
            Easily deploy, maintain,
            <br />
            and connect wallets
            <br />
            across your product stack
          </h1>
          <p className="text-[16px] sm:text-[18px] text-muted-foreground mt-4">
            Launch embedded wallets in under 7 minutes.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const IconComponent = iconMap[item.icon];
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={cn(
                  "group flex items-start gap-5 p-6 lg:p-8 rounded-lg transition-all text-left",
                  isActive
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground bg-transparent",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 transition-colors shrink-0",
                    isActive
                      ? "text-blue-600"
                      : "text-neutral-500 group-hover:text-foreground",
                  )}
                >
                  {IconComponent && (
                    <IconComponent strokeWidth={1.5} size={28} />
                  )}
                </div>
                <div className="flex flex-col items-start justify-start min-w-0">
                  <h3 className="text-[20px] lg:text-[22px] font-medium leading-snug">
                    {item.title}
                  </h3>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-[15px] lg:text-[18px] text-muted-foreground leading-relaxed mt-1">
                          {item.description}
                        </p>
                        {item.cta && (
                          <span className="text-[#4C48FF] font-medium mt-2 text-[16px] lg:text-[15px] block">
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
      <div className="flex-1 relative flex items-end justify-center lg:justify-end overflow-hidden h-full min-h-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute top-10 lg:top-20 w-full h-[150%] flex justify-end"
          >
            <div className="relative w-auto h-auto max-w-[90%]">
              <Image
                src={imageMap[activeId]}
                alt=""
                priority
                className="w-full h-auto object-contain object-top drop-shadow-2xl"
              />
              {activeId === 1 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                  className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[25%] z-20"
                >
                  <Image
                    src={smileIcon}
                    alt="Face ID"
                    className="w-full h-auto drop-shadow-2xl rounded-4xl"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom shadow — feathered polish */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
};

export default FeatureSection;
