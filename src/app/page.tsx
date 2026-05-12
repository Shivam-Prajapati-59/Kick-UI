"use client";
import Container from "@/components/common/Container";
import LandingGrid from "@/components/custom/LandingGrid";
import Hero from "@/components/landing/Hero";

export default function Home() {
  return (
    <Container>
      <Hero />
      <LandingGrid />
    </Container>
  );
}
