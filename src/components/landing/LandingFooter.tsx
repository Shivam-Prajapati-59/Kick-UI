import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";
import FooterWordmark from "@/components/svgs/brand/FooterWordmark";

const footerLinks = [
  {
    title: "Resources",
    links: [
      { label: "Home", href: "/" },
      { label: "Components", href: "/components" },
      { label: "Playground", href: "/playground" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: SITE_CONFIG.github },
      { label: "X / Twitter", href: SITE_CONFIG.twitter },
      { label: "Contribute", href: SITE_CONFIG.github },
    ],
  },
];

const LandingFooter = () => {
  return (
    <footer className="border-border/60 bg-background border-t">
      <div className="mx-auto max-w-7xl px-6 pt-16 sm:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          {/* Brand Section */}
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-0">
              <Image
                src="/logo1.png"
                alt="Kick-UI Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />

              <h2 className="text-2xl font-bold">ick-UI</h2>
            </Link>

            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-6">
              Beautiful animated UI components for React, built to be copied,
              customized, and shipped fast.
            </p>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-20">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="text-foreground/80 mb-4 text-sm font-semibold tracking-[0.18em] uppercase">
                  {section.title}
                </h3>

                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        target={
                          link.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          link.href.startsWith("http")
                            ? "noreferrer"
                            : undefined
                        }
                        className="text-muted-foreground hover:text-foreground text-sm transition"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-border/60 text-muted-foreground mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-center text-sm md:flex-row md:text-left">
          <div className="flex items-center gap-1">
            <span>Created with</span>
            <Heart size={16} className="fill-red-500 text-red-500" />
            <span>by Shivam Prajapati</span>
          </div>
          <p>© {new Date().getFullYear()} Kick-UI. All rights reserved.</p>
        </div>
      </div>
      {/* Giant wordmark — full viewport bleed, outside the container */}
      <div aria-hidden="true" className="mt-8 overflow-hidden select-none lg:px-15">
        <FooterWordmark className="text-foreground h-auto w-full" />
      </div>
    </footer>

  );
};

export default LandingFooter;
