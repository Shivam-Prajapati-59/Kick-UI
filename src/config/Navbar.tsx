export interface NavItem {
    label: string;
    href: string;
}

export const navbarConfig = {
    logo: {
        src: '/logo1.png',
        alt: 'Kick UI',
        width: 40,
        height: 40,
    },
    navItems: [
        { label: 'Components', href: '/components' },
    ] as NavItem[],
    mobileNavItems: [
        { label: 'Components', href: '/components' },
    ] as NavItem[],
    links: {
        github: "https://github.com/shivambadmos/kick-ui",
        twitter: "https://x.com/shivambadmos"
    }
};