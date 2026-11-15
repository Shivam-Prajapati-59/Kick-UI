import type { Metadata } from "next";
import Container from "@/components/common/Container";
import Hero from "@/components/landing/Hero";
import LandingFooter from "@/components/landing/LandingFooter";
import FeaturedComps from "@/components/landing/FeaturedComps";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}` },
  description: SITE_CONFIG.description,
  alternates: { canonical: "/" },
};

export default function Home() {
  // <Hero /> sits outside <Container>: its shader backdrop must own the full
  // viewport width. Hero wraps its own content in <Container> internally.
  return (
    <>
      <Hero />
      <Container>
        <FeaturedComps />
        <LandingFooter />
      </Container>
    </>
  );
}