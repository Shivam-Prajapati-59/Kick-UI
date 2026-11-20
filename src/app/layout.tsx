import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import Provider from "@/providers/provider";
import { ThemeProvider } from "@/components/common/theme-provider";
import { ViewTransitions } from "next-view-transitions";
import { SITE_CONFIG } from "@/lib/site-config";
import { sora } from "@/lib/fonts";
import { getGithubStars } from "@/lib/github-stars";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  applicationName: SITE_CONFIG.name,
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.github }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kick UI logo with an illustrated Web3 interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_CONFIG.twitterHandle,
    creator: SITE_CONFIG.twitterHandle,
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a050f" },
  ],
};

/** Organization + WebSite structured data for rich Google results. */
function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_CONFIG.url}#organization`,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        logo: `${SITE_CONFIG.url}/logo1.png`,
        sameAs: [SITE_CONFIG.github, SITE_CONFIG.twitter],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_CONFIG.url}#website`,
        url: SITE_CONFIG.url,
        name: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        publisher: { "@id": `${SITE_CONFIG.url}#organization` },
        inLanguage: "en-US",
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        // Escape `<` so a `</script>` sequence in content can never break out.
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetched here rather than inside Navbar: Navbar is a client component, and
  // a browser-side fetch would hit GitHub's per-IP rate limit on every visit.
  // `getGithubStars` returns null on any failure, so the badge simply hides.
  const starCount = await getGithubStars();

  return (
    <ViewTransitions>
      {/* Font variables live on <html> so the :root font tokens can resolve them. */}
      <html
        lang="en"
        suppressHydrationWarning
        className={`${dmSans.variable} ${dmMono.variable} ${sora.variable}`}
      >
        <body className="antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Provider starCount={starCount}>{children}</Provider>
          </ThemeProvider>
          <JsonLd />
        </body>
      </html>
    </ViewTransitions>
  );
}
