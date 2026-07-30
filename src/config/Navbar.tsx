export interface NavItem {
    label: string;
    href: string;
}

export const navbarConfig = {
    logo: {
        src: '/logo1.png',
        alt: 'Kick UI',
        width: 30,
        height: 30,
    },
    navItems: [
        { label: 'Components', href: '/components' },
        { label: 'Docs', href: '/docs' },
    ] as NavItem[],
    mobileNavItems: [
        { label: 'Components', href: '/components' },
        { label: 'Docs', href: '/docs' },
    ] as NavItem[],
    links: {
        github: "https://github.com/shivambadmos/kick-ui",
        twitter: "https://x.com/shivambadmos"
    }
};
