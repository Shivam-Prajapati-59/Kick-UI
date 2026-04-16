"use client";
import Container from "@/components/common/Container";
import GradientGrid from "@/components/custom/GradientGrid";
import Hero from "@/components/landing/Hero";

export default function Home() {
  return (
    <Container>
      <Hero />
      <GradientGrid />
    </Container>
  );
}
