export interface NavItem {
  label: string;
  href: string;
}

import { SITE_CONFIG } from "@/lib/site-config";

export const navbarConfig = {
  logo: {
    src: "/logo1.png",
    alt: "Kick UI",
    width: 30,
    height: 30,
  },
  navItems: [{ label: "Components", href: "/components" }] as NavItem[],
  mobileNavItems: [{ label: "Components", href: "/components" }] as NavItem[],
  links: {
    github: SITE_CONFIG.github,
    twitter: SITE_CONFIG.twitter,
  },
};
