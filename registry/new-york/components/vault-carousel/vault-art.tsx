"use client";

import { useId, type ReactNode } from "react";

import type { ArtState } from "./vault-art-core";
import {
  ACCENT,
  ArtContext,
  Skin,
  SW_BASE,
  Zoom,
  skinColors,
  sideStops,
} from "./vault-art-core";
import { IdCardArt } from "./vault-art-id-card";
import { MultisigArt } from "./vault-art-multisig";
import { PadlockArt } from "./vault-art-padlock";
import { PhoneArt } from "./vault-art-phone";
import { RadarArt } from "./vault-art-radar";
import { RobotArt } from "./vault-art-robot";
import { SafeArt } from "./vault-art-safe";
import { ShieldArt } from "./vault-art-shield";

export type VaultArtKind =
  | "shield-lock"
  | "fingerprint"
  | "face-id"
  | "multisig"
  | "vault"
  | "key"
  | "radar"
  | "robot";

const ARTS: Record<
  VaultArtKind,
  {
    Art: () => ReactNode;
    dx: number;
    zoom?: { s: number; from: number; to: number };
  }
> = {
  "shield-lock": { Art: ShieldArt, dx: 3.1 },
  fingerprint: { Art: PhoneArt, dx: 9 },
  "face-id": { Art: IdCardArt, dx: 9 },
  multisig: { Art: MultisigArt, dx: -3.1 },
  radar: { Art: RadarArt, dx: 9 },
  vault: { Art: SafeArt, dx: 0.9, zoom: { s: 1.15, from: 160, to: 164 } },
  key: { Art: PadlockArt, dx: 1.3 },
  robot: { Art: RobotArt, dx: -0.9 },
};

export function FeatureArt({
  kind,
  drawn,
  live,
  onScreen,
  motionAllowed,
}: Omit<ArtState, "id" | "accent" | "sw"> & { kind: VaultArtKind }) {
  // url(#id) needs a plain identifier; React ids may contain colons.
  const id = `gc${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { Art, dx, zoom } = ARTS[kind];
  const a = ACCENT;
  const skins = skinColors(a);
  return (
    <ArtContext.Provider
      value={{
        id,
        drawn,
        live,
        onScreen,
        motionAllowed,
        accent: a,
        sw: zoom ? SW_BASE / zoom.s : SW_BASE,
      }}
    >
      <svg
        viewBox="0 0 240 300"
        aria-hidden
        className="size-full overflow-visible"
      >
        <defs>
          {/* Smooth side shading per material: light left, shadow right. */}
          {(Object.keys(skins) as Skin[]).map((skin) => (
            <linearGradient
              key={skin}
              id={`${id}-side-${skin}`}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              {sideStops(skin, a).map(([offset, color]) => (
                <stop key={offset} offset={offset} stopColor={color} />
              ))}
            </linearGradient>
          ))}
          {/* Narrow dark sliver for far-right edges (also glossy shading). */}
          <linearGradient id={`${id}-sliver`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2a33" />
            <stop offset="1" stopColor="#4a4a55" />
          </linearGradient>
          <linearGradient id={`${id}-accv`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={a.light} />
            <stop offset="1" stopColor={a.deep} />
          </linearGradient>
          <radialGradient id={`${id}-shadow`}>
            <stop offset="0" stopColor={a.base} stopOpacity={0.38} />
            <stop offset="0.7" stopColor={a.base} stopOpacity={0.12} />
            <stop offset="1" stopColor={a.base} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g transform={`translate(${dx} 0)`}>
          {zoom ? (
            <Zoom s={zoom.s} from={zoom.from} to={zoom.to}>
              <Art />
            </Zoom>
          ) : (
            <Art />
          )}
        </g>
      </svg>
    </ArtContext.Provider>
  );
}
