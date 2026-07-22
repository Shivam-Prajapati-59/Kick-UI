'use client'
import Image from 'next/image'
import { useState } from 'react';
import { motion } from 'motion/react';

interface Author {
  name: string;
  role: string;
  company: string;
  avatar: string;
}

interface CTA {
  label: string;
  href: string;
}

interface CardData {
  id: number;
  company: string;
  logo: string;
  cardColor: string;
  title: string;
  description: string;
  author: Author;
  cta: CTA;
}

const carddata: CardData[] = [
  {
    id: 1,
    company: "Ethereum",
    logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    cardColor: "#627EEA",
    title: "The leading smart contract platform powering DeFi, NFTs, and Web3 applications.",
    description: "Ethereum introduced programmable blockchain infrastructure, enabling developers to build decentralized applications, token ecosystems, DAOs, and financial protocols on a global scale.",
    author: {
      name: "Vitalik Buterin",
      role: "Co-founder",
      company: "Ethereum",
      avatar: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
    },
    cta: {
      label: "Explore ecosystem",
      href: "https://ethereum.org"
    }
  },
  {
    id: 2,
    company: "Sui",
    logo: "https://assets.coingecko.com/coins/images/26375/standard/sui-ocean-square.png?1727791290",
    cardColor: "#2e7ee6",
    title: "A Layer 1 blockchain designed for speed, scale, and rich digital assets.",
    description: "Sui is a pioneering Layer 1 blockchain and smart contract platform designed from the bottom up to make digital asset ownership fast, private, secure, and accessible to everyone.",
    author: {
      name: "Evan Cheng",
      role: "Co-founder",
      company: "Mysten Labs",
      avatar: "https://assets.coingecko.com/coins/images/26375/standard/sui-ocean-square.png?1727791290"
    },
    cta: {
      label: "Explore ecosystem",
      href: "https://sui.io"
    }
  },
  {
    id: 3,
    company: "Polygon",
    logo: "https://assets.coingecko.com/coins/images/4713/large/polygon.png",
    cardColor: "#8247E5",
    title: "Scaling Ethereum with fast and low-cost blockchain infrastructure.",
    description: "Polygon provides Layer-2 scaling solutions and infrastructure that enable developers to build consumer-grade decentralized applications with minimal transaction costs.",
    author: {
      name: "Sandeep Nailwal",
      role: "Co-founder",
      company: "Polygon",
      avatar: "https://assets.coingecko.com/coins/images/4713/large/polygon.png"
    },
    cta: {
      label: "Explore ecosystem",
      href: "https://polygon.technology"
    }
  },
  {
    id: 4,
    company: "Avalanche",
    logo: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
    cardColor: "#E84142",
    title: "Customizable blockchain infrastructure for enterprises and developers.",
    description: "Avalanche enables highly scalable decentralized applications through subnets, allowing projects to launch application-specific chains with optimized performance.",
    author: {
      name: "Emin Gün Sirer",
      role: "Founder",
      company: "Avalanche",
      avatar: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png"
    },
    cta: {
      label: "Explore ecosystem",
      href: "https://avax.network"
    }
  },
  {
    id: 5,
    company: "Chainlink",
    logo: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
    cardColor: "#2A5ADA",
    title: "Connecting blockchains with real-world data through decentralized oracles.",
    description: "Chainlink provides secure oracle infrastructure, enabling smart contracts to access off-chain data, payments, AI services, and cross-chain interoperability.",
    author: {
      name: "Sergey Nazarov",
      role: "Co-founder",
      company: "Chainlink",
      avatar: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png"
    },
    cta: {
      label: "Explore ecosystem",
      href: "https://chain.link"
    }
  }
];

const HoverDeck = () => {
  const [expandedId, setExpandedId] = useState<number>(1);

  return (
    <div className="flex flex-row gap-1.5 sm:gap-2 p-3 sm:p-8 items-stretch w-full min-h-[340px] sm:min-h-[500px] lg:min-h-[600px] overflow-hidden">
      {carddata.map((card) => {
        const isExpanded = expandedId === card.id;

        return (
          <motion.div
            key={card.id}
            layout
            onHoverStart={() => setExpandedId(card.id)}
            onClick={() => setExpandedId(card.id)}
            transition={{
              layout: {
                type: "spring",
                stiffness: 400,
                damping: 35,
              },
            }}
            style={{ backgroundColor: card.cardColor }}
            className="relative overflow-hidden rounded-md cursor-pointer min-w-12"
            animate={{
              flex: isExpanded ? 6 : 1,
            }}
          >
            {/* Logo Wrapper — pinned top-left at every breakpoint */}
            <div className="absolute top-2.5 left-2.5 sm:top-6 sm:left-6 w-6 h-6 sm:w-9 sm:h-9 flex items-center justify-center bg-white/50 rounded-full shrink-0 z-10">
              <Image
                src={card.logo}
                alt={card.company}
                width={36}
                height={36}
                className="object-contain w-full h-full p-1"
              />
            </div>
            {/* Expanded Content Wrapper */}
            <motion.div
              initial={false}
              animate={{ opacity: isExpanded ? 1 : 0 }}
              transition={{ duration: 0.3, delay: isExpanded ? 0.1 : 0 }}
              className="absolute inset-0 pt-14 sm:pt-20 px-4 sm:pl-8 sm:pr-8 pb-4 sm:pb-8 text-white w-full sm:w-[600px] lg:w-[800px] flex flex-col pointer-events-none"
            >
              <div>
                <h3 className="font-bold text-base sm:text-xl">{card.company}</h3>
                <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-full sm:max-w-[500px]">{card.title}</p>
              </div>

              <div className="mt-6 sm:mt-12 flex-1">
                <p className="text-xs sm:text-3xl font-medium leading-snug max-w-full sm:max-w-[550px]">
                  {card.description}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 mt-auto mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center overflow-hidden rounded-full shrink-0">
                  <Image src={card.author.avatar} alt={card.author.name} width={40} height={40} className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-white/90 font-medium truncate">{card.author.name}</p>
                  <p className="text-xs text-white/70 truncate">{card.author.role}, {card.author.company}</p>
                </div>
              </div>

              <a href={card.cta.href} className="text-xs sm:text-sm font-medium hover:underline underline-offset-4 pointer-events-auto w-fit">
                {card.cta.label} &rarr;
              </a>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  )
}

export default HoverDeck;