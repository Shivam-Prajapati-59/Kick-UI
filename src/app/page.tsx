"use client";
import Container from "@/components/common/Container";
import Hero from "@/components/landing/Hero";
import FeaturedComponents from "@/components/landing/FeaturedComponents";
import LandingFooter from "@/components/landing/LandingFooter";
import FeaturedComps from "@/components/landing/FeaturedComps";

export default function Home() {
  return (
    <Container>
      <Hero />
      {/* <FeaturedComponents /> */}
      <FeaturedComps />
      <LandingFooter />
    </Container>
  );
}
