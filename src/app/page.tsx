"use client";
import Container from "@/components/common/Container";
import Hero from "@/components/landing/Hero";
import LandingFooter from "@/components/landing/LandingFooter";
import FeaturedComps from "@/components/landing/FeaturedComps";

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
