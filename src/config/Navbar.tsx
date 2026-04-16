// config/navbar.ts
export interface NavItem {
    label: string;
    href: string;
}

export const navbarConfig = {
    logo: {
        src: '/logo.png',
        alt: 'UI-Library Logo',
        width: 40,
        height: 40,
    },
    navItems: [
        { label: 'Templates', href: '/templates' },
        { label: 'Components', href: '/components' },
        { label: 'Docs', href: '/docs' },
    ] as NavItem[],
    links: {
        github: "https://github.com/your-username/your-repo",
        twitter: "https://twitter.com/your-handle"
    }
};