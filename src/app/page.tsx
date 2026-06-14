"use client";
import Container from "@/components/common/Container";
import LandingGrid from "@/components/custom/LandingGrid";
import Hero from "@/components/landing/Hero";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <Container>
      <Hero />
      <LandingGrid />
      <LandingFooter />
    </Container>
  );
}
