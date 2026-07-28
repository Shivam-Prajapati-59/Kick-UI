"use client";
import { useRef } from "react";
import ScrollCard from "@registry/new-york/components/scroll-card/scroll-card";

export default function ScrollCardDemo() {
  const scrollContainer = useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollContainer} className="h-[32rem] w-full scrollbar-hide overflow-y-auto">
      <ScrollCard
        scrollContainer={scrollContainer}
        className="[--scroll-card-viewport-height:32rem]"
      />
    </div>
  );
}
