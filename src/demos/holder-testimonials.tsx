"use client";

import HolderTestimonials, {
  type HolderTestimonial,
} from "@registry/new-york/components/holder-testimonials/holder-testimonials";

const TESTIMONIALS: HolderTestimonial[] = [
  {
    name: "mira.eth",
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    avatar: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    role: "DAO contributor",
    quote:
      "Governance finally feels like a conversation instead of a shouting match. Proposals pass on merit, not momentum.",
    chain: "Ethereum",
    holding: { amount: "42", symbol: "ETH" },
    verified: true,
    since: "2022",
  },
  {
    name: "kaito.base",
    address: "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c",
    avatar:
      "https://coin-images.coingecko.com/asset_platforms/images/131/large/base.png?1759905869",
    role: "Liquidity provider",
    quote:
      "We rebuilt our whole routing in a week. Slippage dropped, and the flow finally feels calm for everyone swapping.",
    chain: "Base",
    holding: { amount: "8.2", symbol: "ETH" },
    verified: true,
    since: "2023",
  },
  {
    name: "0xRafa",
    address: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
    avatar: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    role: "Treasury lead",
    quote:
      "It slotted straight into our custody flow. Clients now ask who built it, which is the best compliment we get.",
    chain: "BTC",
    holding: { amount: "3.1", symbol: "BTC" },
    since: "2019",
  },
  {
    name: "saoirse.eth",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    avatar: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
    role: "Payments lead",
    quote:
      "Settling in dollars on Arc made reconciliation boring in the best way. Fast, predictable and easy to explain to finance.",
    chain: "Arc",
    holding: { amount: "120,000", symbol: "USDC" },
    verified: true,
    since: "2025",
  },
  {
    name: "noor.sol",
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    avatar: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    role: "Protocol designer",
    quote:
      "Polished, flexible and quick to customise. It is the first section our visitors interact with, and they stay longer.",
    chain: "Solana",
    holding: { amount: "18,900", symbol: "SOL" },
    verified: true,
    since: "2023",
  },
];

export default function HolderTestimonialsDemo() {
  return (
    <div className="flex min-h-[520px] w-full items-center justify-center rounded-2xl bg-neutral-100 p-6 dark:bg-black">
      <HolderTestimonials testimonials={TESTIMONIALS} />
    </div>
  );
}
