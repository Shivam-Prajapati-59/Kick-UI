"use client";

import VaultCarousel, {
  type VaultFeature,
} from "@registry/new-york/components/vault-carousel/vault-carousel";

const FEATURES: VaultFeature[] = [
  {
    name: "Spend Guard",
    tagline: "Smart-account spending policies",
    category: "Custody",
    illustration: "shield-lock",
    chain: "Arbitrum",
    since: "2023",
    metric: { value: "$50k", label: "Default daily limit" },
    description:
      "Every outgoing transfer is checked against per-asset limits and an allowlist before it can be signed. Anything over the line waits for a second approval.",
  },
  {
    name: "Biometric Unlock",
    tagline: "Fingerprint-gated signing",
    category: "Identity",
    illustration: "fingerprint",
    chain: "Any EVM",
    since: "2023",
    metric: { value: "1.2M", label: "Devices enrolled" },
    description:
      "Signing keys sit in the device secure enclave and only release a signature after a local fingerprint match. Nothing biometric leaves the phone.",
  },
  {
    name: "Multisig Vault",
    tagline: "2-of-3 signer custody",
    category: "Custody",
    illustration: "multisig",
    chain: "Ethereum",
    since: "2021",
    metric: { value: "$2.4B", label: "Assets secured" },
    description:
      "Treasury moves need two of three independent signers. Losing one device never locks the vault, and one compromised key can't drain it.",
  },
  {
    name: "Face Verify",
    tagline: "Liveness-checked approvals",
    category: "Identity",
    illustration: "face-id",
    chain: "Base",
    since: "2024",
    metric: { value: "0.4s", label: "Median check time" },
    description:
      "High-value approvals ask for a quick liveness check, so a stolen session can't approve a withdrawal on its own.",
  },
  {
    name: "MPC Key Shards",
    tagline: "No single private key, ever",
    category: "Keys",
    illustration: "key",
    chain: "Multi-chain",
    since: "2022",
    metric: { value: "2 of 3", label: "Shards needed to sign" },
    description:
      "The key is generated in three shards held on separate machines. Signatures are computed jointly, so the full key never exists in one place.",
  },
  {
    name: "Cold Storage",
    tagline: "Air-gapped reserves",
    category: "Custody",
    illustration: "vault",
    chain: "Bitcoin",
    since: "2020",
    metric: { value: "94%", label: "Of reserves kept offline" },
    description:
      "Most reserves sit in air-gapped hardware behind a time-locked withdrawal flow. Hot wallets only hold what a day of activity needs.",
  },
  {
    name: "Social Recovery",
    tagline: "Guardians restore lost access",
    category: "Keys",
    illustration: "radar",
    chain: "Optimism",
    since: "2024",
    metric: { value: "3 of 5", label: "Guardians to recover" },
    description:
      "Lose your device and trusted guardians can rotate your signing key after a 48-hour delay, which you can cancel if it wasn't you.",
  },
  {
    name: "Agent Guard",
    tagline: "AI transaction screening",
    category: "Custody",
    illustration: "robot",
    chain: "Any EVM",
    since: "2025",
    metric: { value: "38K", label: "Drainers blocked" },
    description:
      "Every transaction is simulated and screened by an on-device agent before you sign. Known drainers and suspicious approvals are flagged with a plain-language reason.",
  },
];

export default function VaultCarouselDemo() {
  return (
    <VaultCarousel
      features={FEATURES}
      eyebrow="Security stack"
      title={"Every key,\nguarded twice"}
    />
  );
}
