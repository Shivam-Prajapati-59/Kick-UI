"use client";

import { ArtFrame, Float, Live, Rise, useArt } from "./vault-art-core";

export function IdCardArt() {
  const { id: p } = useArt();
  return (
    <ArtFrame viewBox="252 250 160 200">
      <defs>
        <filter id={`${p}-id1`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <linearGradient
          id={`${p}-id2`}
          x1="263.75"
          y1="0"
          x2="386.25"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fdfcfa" />
          <stop offset="0.4" stopColor="#f1ede6" />
          <stop offset="0.65" stopColor="#ddd4c4" />
          <stop offset="0.87" stopColor="#cbbfaa" />
          <stop offset="0.87" stopColor="#141414" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
        <filter id={`${p}-id3`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <linearGradient
          id={`${p}-id4`}
          x1="269"
          y1="0"
          x2="381"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#36a8ff" />
          <stop offset="0.28" stopColor="#1490f7" />
          <stop offset="0.72" stopColor="#0c7fe6" />
          <stop offset="1" stopColor="#0a56a8" />
        </linearGradient>
        <linearGradient
          id={`${p}-id5`}
          x1="263.75"
          y1="0"
          x2="386.25"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fdfcfa" />
          <stop offset="0.4" stopColor="#f3efe8" />
          <stop offset="0.68" stopColor="#e3dbcc" />
          <stop offset="0.92" stopColor="#cdc1ab" />
          <stop offset="0.93" stopColor="#141414" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
        <clipPath id={`${p}-id6`}>
          <path d="M263.75,351 A61.25,30 0 1 0 386.25,351 A61.25,30 0 1 0 263.75,351 Z" />
        </clipPath>
        <filter id={`${p}-id7`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`${p}-id8`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <linearGradient
          id={`${p}-id9`}
          x1="300"
          y1="295"
          x2="290"
          y2="350"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#a9cbf5" />
          <stop offset="1" stopColor="#2a9dfc" />
        </linearGradient>
        <linearGradient
          id={`${p}-id10`}
          x1="300"
          y1="280"
          x2="372"
          y2="360"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fbfaf7" />
          <stop offset="0.7" stopColor="#f3efe7" />
          <stop offset="1" stopColor="#e4ddd0" />
        </linearGradient>
      </defs>
      <path
        d="M350,420 A30,26 0 1 0 410,420 A30,26 0 1 0 350,420 Z"
        fill="#a6c6ef"
        filter={`url(#${p}-id1)`}
        opacity=".9"
      />
      <Rise>
        <path
          d="M263.75,380 L263.75,414 A61.25,30 0 0 0 386.25,414 L386.25,380 A61.25,30 0 0 1 263.75,380 Z"
          fill={`url(#${p}-id2)`}
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M263.75,380 A61.25,30 0 1 0 386.25,380 A61.25,30 0 1 0 263.75,380 Z"
          fill="#f8f6f1"
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <ellipse cx="277.4" cy="421.88" rx="1.9" ry="2.2" fill="#121212" />
        <ellipse cx="281.69" cy="424.21" rx="1.9" ry="2.2" fill="#121212" />
        <ellipse cx="286.45" cy="426.31" rx="1.9" ry="2.2" fill="#121212" />
        <path
          d="M355.62,439.98 L355.62,439.98 L355.62,405.98 L355.62,405.98"
          fill="none"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity=".7"
        />
        <ellipse
          cx="325"
          cy="385"
          rx="66"
          ry="30"
          fill="#1490f7"
          opacity=".55"
          filter={`url(#${p}-id3)`}
        />
        <path
          d="M269,370 L269,381 A56,27.5 0 0 0 381,381 L381,370 A56,27.5 0 0 1 269,370 Z"
          fill={`url(#${p}-id4)`}
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M263.75,351 L263.75,371 A61.25,30 0 0 0 386.25,371 L386.25,351 A61.25,30 0 0 1 263.75,351 Z"
          fill={`url(#${p}-id5)`}
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M263.75,351 A61.25,30 0 1 0 386.25,351 A61.25,30 0 1 0 263.75,351 Z"
          fill="#fdfcfa"
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M267.44,367.26 L268.54,368.63 L269.76,369.96 L271.12,371.27 L272.61,372.54 L274.22,373.78 L275.96,374.97 L277.81,376.12 L279.77,377.23 L281.84,378.29 L284.02,379.29 L284.02,392.29"
          fill="none"
          stroke="#121212"
          strokeWidth="1.3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <g clipPath={`url(#${p}-id6)`}>
          <ellipse
            cx="345"
            cy="362"
            rx="44"
            ry="20"
            fill="#a9cbf5"
            opacity=".75"
            filter={`url(#${p}-id7)`}
          />
          <ellipse
            cx="350"
            cy="356"
            rx="30"
            ry="12"
            fill="#ffffff"
            opacity=".35"
            filter={`url(#${p}-id8)`}
          />
        </g>
        <path
          d="M263.75,351 A61.25,30 0 1 0 386.25,351 A61.25,30 0 1 0 263.75,351 Z"
          fill="none"
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Float lift={6}>
          <Live on={{ rotate: -6 }} origin="50% 100%">
            <path
              d="M301,295 L279,351 L309.8,333 Z"
              fill={`url(#${p}-id9)`}
              stroke="#121212"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d="M279,351 L309.8,333 L319.5,375 Z"
              fill="#121212"
              stroke="#121212"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d="M301.81,298.5 L301.73,297.32 L302,296.08 L302.58,294.87 L303.43,293.84 L304.46,293.07 L347.03,269.43 L348.15,269 L349.23,268.96 L350.17,269.31 L350.89,270.01 L351.31,271 L368.19,344 L368.27,345.18 L368,346.42 L367.42,347.63 L366.57,348.66 L365.53,349.43 L322.96,373.07 L321.85,373.5 L320.77,373.54 L319.83,373.19 L319.11,372.49 L318.69,371.5 Z"
              fill={`url(#${p}-id10)`}
              stroke="#121212"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d="M318.36,283.1 L318.3,282.26 L318.49,281.37 L318.91,280.51 L319.52,279.77 L320.25,279.23 L329.16,274.27 L329.96,273.97 L330.73,273.94 L331.41,274.19 L331.92,274.69 L332.22,275.4 L332.91,278.4 L332.97,279.24 L332.78,280.13 L332.36,280.99 L331.75,281.73 L331.01,282.27 L322.1,287.23 L321.31,287.53 L320.54,287.56 L319.86,287.31 L319.35,286.81 L319.05,286.1 Z"
              fill="#7cc3ff"
              stroke="#121212"
              strokeWidth="1.4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <g transform="matrix(0.99,-0.55,0.23,1,301,295)" fill="#121212">
              <ellipse cx="25" cy="16.5" rx="6.8" ry="7.8" />
              <path d="M14.5,41 L14.5,33.5 C14.5,26.5 19,25 25,25 C31,25 35.5,26.5 35.5,33.5 L35.5,41 Z" />
              <rect x="12.5" y="47.5" width="26" height="5.2" rx="2.6" />
              <rect x="9" y="57.5" width="33" height="5.2" rx="2.6" />
            </g>
          </Live>
        </Float>
      </Rise>
    </ArtFrame>
  );
}

// Robot sentinel; the head tilts and the visor glows while live (user-supplied art).
