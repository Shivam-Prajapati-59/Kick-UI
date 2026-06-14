import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
            { label: "GitHub", href: "https://github.com/your-username/kick-ui" },
            { label: "X / Twitter", href: "https://x.com/your-handle" },
            { label: "Contribute", href: "https://github.com/your-username/kick-ui" },
        ],
    },
];

const LandingFooter = () => {
    return (
        <footer className="border-t border-border/60 bg-background">
            <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
                <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
                    {/* Brand Section */}
                    <div className="max-w-sm">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/logo1.png"
                                alt="Kick-UI Logo"
                                width={40}
                                height={40}
                                className="rounded-lg"
                            />

                            <h2 className="text-2xl font-bold">Kick-UI</h2>
                        </Link>

                        <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                            Beautiful animated UI components for React, built to be copied, customized, and shipped fast.
                        </p>
                    </div>

                    {/* Footer Links */}
                    <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-20">
                        {footerLinks.map((section) => (
                            <div key={section.title}>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-foreground/80">
                                    {section.title}
                                </h3>

                                <ul className="space-y-3">
                                    {section.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                target={link.href.startsWith("http") ? "_blank" : undefined}
                                                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                                                className="text-sm text-muted-foreground transition hover:text-foreground"
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
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground md:flex-row md:text-left">
                    <div className="flex items-center gap-1">
                        <span>Created with</span>
                        <Heart size={16} className="fill-red-500 text-red-500" />
                        <span>by Shivam Prajapati</span>
                    </div>
                    <p>
                        © {new Date().getFullYear()} Kick-UI. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default LandingFooter;
