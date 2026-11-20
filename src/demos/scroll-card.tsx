"use client";
import { useRef } from "react";
import ScrollCard from "@registry/new-york/components/scroll-card/scroll-card";

export default function ScrollCardDemo() {
  const scrollContainer = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollContainer}
      className="scrollbar-hide h-[40rem] w-full overflow-y-auto"
    >
      <ScrollCard
        scrollContainer={scrollContainer}
        scrollHeight="500%"
        className="[--scroll-card-viewport-height:38rem]"
      />
    </div>
  );
}
