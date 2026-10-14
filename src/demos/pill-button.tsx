"use client";

import { PillButton } from "@registry/new-york/components/pill-button/pill-button";
import Image from "next/image";

export default function PillButtonDemo() {
  return (
    <PillButton>
      <Image
        src="https://cdn.prod.website-files.com/6840859dc0e82803d10f5190/685503b55e9cc865a796e3e6_Russia.svg"
        alt="Russian"
        width={40}
        height={40}
        className="h-10 w-10 object-contain"
      />
      <span>Russian</span>
    </PillButton>
  );
}
