"use client";

import { ArtFrame, Float, Live, Rise, useArt } from "./vault-art-core";

export function RobotArt() {
  const { id: p } = useArt();
  return (
    <ArtFrame viewBox="690 255 150 200">
      <defs>
        <filter id={`${p}-rb1`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <linearGradient
          id={`${p}-rb2`}
          x1="720"
          y1="0"
          x2="811"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fbfaf7" />
          <stop offset="0.46" stopColor="#f3f0ea" />
          <stop offset="0.82" stopColor="#ddd5c6" />
          <stop offset="1" stopColor="#c9bea9" />
        </linearGradient>
        <linearGradient
          id={`${p}-rb3`}
          x1="705"
          y1="340"
          x2="735"
          y2="380"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#f7f5f0" />
          <stop offset="1" stopColor="#ddd5c6" />
        </linearGradient>
        <linearGradient
          id={`${p}-rb4`}
          x1="740"
          y1="362"
          x2="755"
          y2="386"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#d9e8fb" />
          <stop offset="1" stopColor="#36a8ff" />
        </linearGradient>
        <linearGradient
          id={`${p}-rb5`}
          x1="729"
          y1="0"
          x2="813"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fcfbf8" />
          <stop offset="0.49" stopColor="#f5f2ec" />
          <stop offset="0.85" stopColor="#e2dacc" />
          <stop offset="1" stopColor="#cfc4b0" />
        </linearGradient>
        <clipPath id={`${p}-rb6`}>
          <path d="M730,321 C729,295 747,275.5 772,275.5 C797,275.5 814,294 813,319 L812.5,326 C810,334 795,340 772,340 C750,340 733,334 731,327 Z" />
        </clipPath>
        <linearGradient
          id={`${p}-rb7`}
          x1="730"
          y1="300"
          x2="785"
          y2="325"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#d9e8fb" />
          <stop offset="0.6" stopColor="#a9cbf5" />
          <stop offset="1" stopColor="#36a8ff" />
        </linearGradient>
        <linearGradient
          id={`${p}-rb8`}
          x1="758.6"
          y1="0"
          x2="787.4"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fdfcfa" />
          <stop offset="0.57" stopColor="#efe9df" />
          <stop offset="0.7" stopColor="#e6dece" />
          <stop offset="0.72" stopColor="#141414" />
          <stop offset="0.8" stopColor="#141414" />
          <stop offset="0.81" stopColor="#ffffff" />
          <stop offset="0.84" stopColor="#ffffff" />
          <stop offset="0.85" stopColor="#141414" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
        <linearGradient
          id={`${p}-rb9`}
          x1="799"
          y1="0"
          x2="828"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#efebe3" />
          <stop offset="1" stopColor="#bdb19c" />
        </linearGradient>
        <linearGradient
          id={`${p}-rb10`}
          x1="801"
          y1="0"
          x2="830"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fbfaf7" />
          <stop offset="0.52" stopColor="#efebe4" />
          <stop offset="0.79" stopColor="#bdb8ae" />
          <stop offset="1" stopColor="#7e7b76" />
        </linearGradient>
      </defs>
      <ellipse
        cx="767"
        cy="434"
        rx="42"
        ry="16"
        fill="#a6c6ef"
        opacity=".9"
        filter={`url(#${p}-rb1)`}
      />
      <ellipse
        cx="767"
        cy="433.5"
        rx="27"
        ry="9"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        opacity=".95"
      />
      <Rise>
        <Float lift={6}>
          <path
            d="M733,333 C721,339 709,357 703,385 C713,380 723,373 730,364 Z"
            fill={`url(#${p}-rb3)`}
            stroke="#121212"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M703,385 C713,380 723,373 730,364 L732,368 C726,378 714,386 703,387.5 Z"
            fill="#121212"
            stroke="#121212"
            strokeWidth="1.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M708.5,380 C715,376 721,371 726,364"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.1"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M729,343 C717,362 720,393 741,413 C751,423 761,428.5 769,428.5 C784,428.5 797,415 803,399 C810,381 811,358 805,343 Z"
            fill={`url(#${p}-rb2)`}
            stroke="#121212"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M738,400.5 C752,409.5 784,410.5 800,399.5"
            fill="none"
            stroke="#7cc3ff"
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <ellipse
            cx="747"
            cy="373.5"
            rx="7.6"
            ry="12.2"
            transform="rotate(-12 747 373.5)"
            fill={`url(#${p}-rb4)`}
            stroke="#121212"
            strokeWidth="1.5"
          />
          <ellipse cx="771" cy="340.5" rx="33" ry="9.5" fill="#121212" />
          <Live on={{ rotate: -7 }} origin="50% 100%">
            <path
              d="M730,321 C729,295 747,275.5 772,275.5 C797,275.5 814,294 813,319 L812.5,326 C810,334 795,340 772,340 C750,340 733,334 731,327 Z"
              fill={`url(#${p}-rb5)`}
              stroke="#121212"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <g clipPath={`url(#${p}-rb6)`}>
              <path
                d="M725,293 C744,298 766,304.5 774,307.5 C782,310.5 784.5,316.5 783,322.5 C781,328.5 775,330.5 767,329 C752,326 738,323 725,320 Z"
                fill={`url(#${p}-rb7)`}
                stroke="#121212"
                strokeWidth="1.5"
              />
            </g>
            {/* Visor glow while live (opacity only, no blur). */}
            <g clipPath={`url(#${p}-rb6)`}>
              <Live on={{ opacity: 0.55 }} off={{ opacity: 0 }}>
                <path
                  d="M725,293 C744,298 766,304.5 774,307.5 C782,310.5 784.5,316.5 783,322.5 C781,328.5 775,330.5 767,329 C752,326 738,323 725,320 Z"
                  fill="#eef5fd"
                />
              </Live>
            </g>
            <path
              d="M730,321 C729,295 747,275.5 772,275.5 C797,275.5 814,294 813,319 L812.5,326 C810,334 795,340 772,340 C750,340 733,334 731,327 Z"
              fill="none"
              stroke="#121212"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d="M730.5,320 C745,331 799,333 812.5,319"
              fill="none"
              stroke="#121212"
              strokeWidth="1.3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <ellipse cx="802.5" cy="321" rx="4.2" ry="8" fill="#121212" />
            <path
              d="M758.6,271 L758.6,281.5 A14.4,6.2 0 0 0 787.4,281.5 L787.4,271 A14.4,6.2 0 0 1 758.6,271 Z"
              fill={`url(#${p}-rb8)`}
              stroke="#121212"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d="M758.6,271 A14.4,6.2 0 1 0 787.4,271 A14.4,6.2 0 1 0 758.6,271 Z"
              fill="#fdfcfa"
              stroke="#121212"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </Live>
          <path
            d="M799,351.5 L818,355.5 A10,16.5 0 0 1 818,388.5 L799,386.5 Z"
            fill={`url(#${p}-rb9)`}
            stroke="#121212"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <ellipse
            cx="799"
            cy="369"
            rx="10"
            ry="17.5"
            fill="#f6f3ed"
            stroke="#121212"
            strokeWidth="1.5"
          />
          <ellipse
            cx="801.5"
            cy="369.5"
            rx="6.8"
            ry="13.2"
            fill="#ece6dc"
            stroke="#121212"
            strokeWidth="1.3"
          />
          <path
            d="M806,364 C815,357 828,361.5 829.5,378 C830.5,395 822,412 810.5,423.5 C804,410 801,392 802,378 C802.3,371 803.5,366.5 806,364 Z"
            fill={`url(#${p}-rb10)`}
            stroke="#121212"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Float>
      </Rise>
    </ArtFrame>
  );
}

// Radar stack (user-supplied art): a floating radar lid above an open cup.
// While live the lid lifts and the sweep wedges turn in the lid's plane.
