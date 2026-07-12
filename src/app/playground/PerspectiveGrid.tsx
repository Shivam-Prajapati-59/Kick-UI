"use client";

import { motion } from "motion/react";

const Blockchains = [
  {
    id: 1,
    name: "Bitcoin",
    symbol: "BTC",
    logo: "/assets/chains/bitcoin.png",
  },
  {
    id: 2,
    name: "Ethereum",
    symbol: "ETH",
    logo: "/assets/chains/ethereum.png",
  },
  {
    id: 3,
    name: "BNB Chain",
    symbol: "BNB",
    logo: "/assets/chains/bnb.png",
  },
  {
    id: 4,
    name: "Solana",
    symbol: "SOL",
    logo: "/assets/chains/solana.png",
  },
  {
    id: 5,
    name: "Polygon",
    symbol: "POL",
    logo: "/assets/chains/polygon.png",
  },
  {
    id: 6,
    name: "Avalanche",
    symbol: "AVAX",
    logo: "/assets/chains/avalanche.png",
  },
  {
    id: 7,
    name: "Arbitrum",
    symbol: "ARB",
    logo: "/assets/chains/arbitrum.png",
  },
  {
    id: 8,
    name: "Optimism",
    symbol: "OP",
    logo: "/assets/chains/optimism.png",
  },
  {
    id: 9,
    name: "Base",
    symbol: "BASE",
    logo: "/assets/chains/base.png",
  },
  {
    id: 10,
    name: "Sui",
    symbol: "SUI",
    logo: "/assets/chains/sui.png",
  },
  {
    id: 11,
    name: "Aptos",
    symbol: "APT",
    logo: "/assets/chains/aptos.png",
  },
  {
    id: 12,
    name: "Cosmos",
    symbol: "ATOM",
    logo: "/assets/chains/cosmos.png",
  },
  {
    id: 13,
    name: "Polkadot",
    symbol: "DOT",
    logo: "/assets/chains/polkadot.png",
  },
  {
    id: 14,
    name: "Near Protocol",
    symbol: "NEAR",
    logo: "/assets/chains/near.png",
  },
  {
    id: 15,
    name: "Tron",
    symbol: "TRX",
    logo: "/assets/chains/tron.png",
  },
  {
    id: 16,
    name: "Filecoin",
    symbol: "FIL",
    logo: "/assets/chains/filecoin.png",
  },
  {
    id: 17,
    name: "Celestia",
    symbol: "TIA",
    logo: "/assets/chains/celestia.png",
  },
  {
    id: 18,
    name: "Injective",
    symbol: "INJ",
    logo: "/assets/chains/injective.png",
  },
  {
    id: 19,
    name: "Cardano",
    symbol: "ADA",
    logo: "/assets/chains/cardano.png",
  },
  {
    id: 20,
    name: "Toncoin",
    symbol: "TON",
    logo: "/assets/chains/toncoin.png",
  },
  {
    id: 21,
    name: "Starknet",
    symbol: "STRK",
    logo: "/assets/chains/starknet.png",
  },
  {
    id: 22,
    name: "zkSync",
    symbol: "ZK",
    logo: "/assets/chains/zksync.png",
  },
  {
    id: 23,
    name: "Internet Computer",
    symbol: "ICP",
    logo: "/assets/chains/icp.png",
  },
  {
    id: 24,
    name: "Sei",
    symbol: "SEI",
    logo: "/assets/chains/sei.png",
  },
];

const PerspectiveGrid = () => {
  return (
    <div className="relative w-full overflow-hidden py-10 md:py-20">
      <div className="w-full flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center text-center z-10 px-4">
          <p className="text-[#00bfff] font-medium text-[17px] cursor-pointer">
            Multi-chain ecosystem &gt;
          </p>
          <h1 className="text-[2.75rem] md:text-[3.5rem] font-medium leading-[1.1] tracking-tight">
            Any transaction on any chain, <br />
            Aside executes it for you.
          </h1>
        </div>

        <motion.div
          style={{
            rotateX: "45deg",
            transformPerspective: 1000,
          }}
          className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-6 lg:gap-x-3 lg:gap-y-6 max-w-5xl mx-auto w-full z-0 px-4 md:px-8 -mt-8"
        >
          {Blockchains.map((blockchain, index) => (
            <motion.div
              key={blockchain.id}
              initial={{ opacity: 0, scale: 0.8, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{
                y: -7,
                scale: 1.02,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 10,
                delay: index * 0.04,
              }}
              className="relative w-16 h-16 md:w-28 md:h-28 cursor-pointer mx-auto group"
            >
              {/* Separate shadow element perfectly matching the original source */}
              <div
                className="pointer-events-none absolute z-10 rounded-full left-1/2 -translate-x-1/2 opacity-30 blur-[1px] transition-all duration-300 group-hover:scale-x-110 group-hover:scale-y-150 group-hover:opacity-70 group-hover:blur-[3px] bg-[radial-gradient(rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.2)_60%,transparent_80%)] dark:bg-[radial-gradient(rgba(180,180,200,0.25)_0%,rgba(180,180,200,0.08)_60%,transparent_80%)]"
                style={{
                  bottom: "-1%",
                  width: "80%",
                  height: "2%",
                }}
              />

              {/* The card itself */}
              <div className="absolute inset-0 bg-white dark:bg-[#0c0c0e] border-[0.5px] border-[#f9f6f6] dark:border-[#1a1a1f] hover:border-[#f2efef] dark:hover:border-[#2b2b36] rounded-[1.25rem] z-10 flex items-center justify-center overflow-hidden transition-colors duration-300">
                <img
                  src={blockchain.logo}
                  alt={blockchain.name}
                  className="w-[88%] h-[88%] object-contain"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PerspectiveGrid;
