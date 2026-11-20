import type { Metadata } from "next";
import Container from "@/components/common/Container";
import Hero from "@/components/landing/Hero";
import LandingFooter from "@/components/landing/LandingFooter";
import FeaturedComps from "@/components/landing/FeaturedComps";
import { componentIndex } from "@/generated/component-index";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}` },
  description: SITE_CONFIG.description,
  alternates: { canonical: "/" },
};

/** SoftwareApplication structured data for the homepage. */
function HomeJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_CONFIG.url}#software`,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    codeRepository: SITE_CONFIG.github,
    publisher: { "@id": `${SITE_CONFIG.url}#organization` },
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
    },
    additionalProperty: {
      "@type": "PropertyValue",
      name: "components",
      value: componentIndex.length,
    },
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

export default function Home() {
  // <Hero /> sits outside <Container>: its shader backdrop must own the full
  // viewport width. Hero wraps its own content in <Container> internally.
  return (
    <>
      <HomeJsonLd />
      <Hero />
      <Container>
        <FeaturedComps />
        <LandingFooter />
      </Container>
    </>
  );
}
