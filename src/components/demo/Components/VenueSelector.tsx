"use client";

import { useState } from "react";
import Image from "next/image";
import {
  VenueSelector,
  VenueSelectorContent,
  VenueSelectorItem,
  VenueSelectorTrigger,
  VenueSelectorValue,
} from "@registry/new-york/components/venue-selector/venue-selector";

type VenueId = "hyperliquid" | "lighter" | "pacifica" | "aster";

const venues: Record<VenueId, { id: VenueId; name: string; logoUrl: string }> =
{
  hyperliquid: {
    id: "hyperliquid",
    name: "Hyperliquid",
    logoUrl:
      "https://assets.coingecko.com/coins/images/50882/standard/hyperliquid.jpg?1729431300",
  },
  lighter: {
    id: "lighter",
    name: "Lighter",
    logoUrl:
      "https://assets.coingecko.com/coins/images/71121/standard/lighter.png?1765888098",
  },
  pacifica: {
    id: "pacifica",
    name: "Pacifica",
    logoUrl:
      "https://assets.coingecko.com/markets/images/22171/large/Cyan_Logo_Dark_Background_%281%29.png?1764569549",
  },
  aster: {
    id: "aster",
    name: "Aster",
    logoUrl:
      "https://assets.coingecko.com/coins/images/69040/standard/_ASTER.png?1757326782",
  },
};

export default function VenueSelectorDemo() {
  const [values, setValues] = useState<VenueId[]>(["hyperliquid", "lighter"]);
  const selectedVenues = values.map((venue) => venues[venue]);

  return (
    <div className="flex h-64 w-full items-start justify-center pt-20">
      <div className="w-56">
        <VenueSelector
          values={values}
          onValuesChange={(nextValues) => setValues(nextValues as VenueId[])}
        >
          <VenueSelectorTrigger>
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex shrink-0 -space-x-1">
                {selectedVenues.map((venue) => (
                  <Image
                    key={venue.id}
                    src={venue.logoUrl}
                    alt=""
                    width={20}
                    height={20}
                    className="ring-card size-5 rounded-full ring-2"
                  />
                ))}
              </span>
              <VenueSelectorValue
                placeholder="Select a venue"
                singularLabel="venue"
                pluralLabel="venues"
              />
            </span>
          </VenueSelectorTrigger>

          <VenueSelectorContent>
            {Object.values(venues).map((venue) => (
              <VenueSelectorItem key={venue.id} value={venue.id}>
                <Image
                  src={venue.logoUrl}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 rounded-full"
                />
                {venue.name}
              </VenueSelectorItem>
            ))}
          </VenueSelectorContent>
        </VenueSelector>
      </div>
    </div>
  );
}
