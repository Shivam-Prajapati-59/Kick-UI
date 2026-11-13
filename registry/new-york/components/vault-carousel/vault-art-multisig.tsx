"use client";

import { ArtFrame, Float, Rise, useArt } from "./vault-art-core";

export function MultisigArt() {
  const { id: p } = useArt();
  return (
    <ArtFrame viewBox="345 15 182 204">
      <defs>
        <filter id={`${p}-cb1`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.8" />
        </filter>
        <linearGradient
          id={`${p}-cb2`}
          x1="366.5"
          y1="0"
          x2="511"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fbfaf7" />
          <stop offset="0.43" stopColor="#f3f0ea" />
          <stop offset="0.56" stopColor="#ddd2c0" />
          <stop offset="1" stopColor="#c6b8a3" />
        </linearGradient>
        <linearGradient
          id={`${p}-cb3`}
          x1="366.5"
          y1="0"
          x2="511"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#3aa3fb" />
          <stop offset="0.51" stopColor="#1b8ef6" />
          <stop offset="1" stopColor="#0f74d9" />
        </linearGradient>
        <clipPath id={`${p}-cb4`}>
          <path d="M494.11,124.31 L494.85,124.76 L495.44,125.27 L495.88,125.82 L496.16,126.4 L496.25,127 L496.18,127.6 L495.93,128.18 L495.51,128.73 L494.93,129.24 L494.21,129.69 L444.88,156.26 L444.03,156.65 L443.08,156.96 L442.05,157.19 L440.96,157.33 L439.84,157.38 L438.72,157.33 L437.63,157.19 L436.59,156.96 L435.62,156.65 L434.76,156.26 L384.39,129.69 L383.65,129.24 L383.06,128.73 L382.62,128.18 L382.34,127.6 L382.25,127 L382.32,126.4 L382.57,125.82 L382.99,125.27 L383.57,124.76 L384.29,124.31 L433.62,97.74 L434.47,97.35 L435.42,97.04 L436.45,96.81 L437.54,96.67 L438.66,96.62 L439.78,96.67 L440.87,96.81 L441.91,97.04 L442.88,97.35 L443.74,97.74 Z" />
        </clipPath>
        <linearGradient
          id={`${p}-cb5`}
          x1="0"
          y1="120"
          x2="0"
          y2="160"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fbf7f1" />
          <stop offset="1" stopColor="#f1e9df" />
        </linearGradient>
        <filter id={`${p}-cb6`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient
          id={`${p}-cb7`}
          x1="414"
          y1="72"
          x2="439"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#e4edf8" />
          <stop offset="1" stopColor="#a9cbf5" />
        </linearGradient>
        <linearGradient
          id={`${p}-cb8`}
          x1="440"
          y1="75"
          x2="465"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#d9e8fb" />
          <stop offset="0.45" stopColor="#86b8f5" />
          <stop offset="1" stopColor="#3f92f0" />
        </linearGradient>
        <linearGradient
          id={`${p}-cb9`}
          x1="0"
          y1="100"
          x2="0"
          y2="145"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#c4dbf7" />
          <stop offset="0.35" stopColor="#eef2f6" />
          <stop offset="1" stopColor="#f3f0ea" />
        </linearGradient>
      </defs>
      <path
        d="M512.05,176.5 L513.1,177.15 L513.96,177.88 L514.58,178.67 L514.98,179.5 L515.12,180.35 L515.01,181.2 L514.65,182.03 L514.05,182.82 L513.23,183.55 L512.2,184.2 L462.15,211.15 L460.94,211.7 L459.58,212.15 L458.11,212.48 L456.55,212.68 L454.96,212.74 L453.36,212.68 L451.79,212.48 L450.31,212.15 L448.93,211.7 L447.7,211.15 L403.9,188.05 L402.85,187.4 L401.99,186.67 L401.37,185.88 L400.97,185.05 L400.83,184.2 L400.94,183.35 L401.3,182.52 L401.9,181.73 L402.72,181 L403.75,180.35 L453.8,153.4 L455.01,152.85 L456.37,152.4 L457.84,152.07 L459.4,151.87 L460.99,151.81 L462.59,151.87 L464.16,152.07 L465.64,152.4 L467.02,152.85 L468.25,153.4 Z"
        fill="#a6c6ef"
        filter={`url(#${p}-cb1)`}
        opacity=".9"
      />
      <Rise>
        <path
          d="M371.23,132.5 L371.34,131.65 L371.7,130.82 L372.3,130.03 L373.12,129.3 L374.15,128.65 L431.35,97.85 L432.56,97.3 L433.92,96.85 L435.39,96.52 L436.95,96.32 L438.54,96.25 L440.14,96.32 L441.71,96.52 L443.19,96.85 L444.57,97.3 L445.8,97.85 L504.2,128.65 L505.25,129.3 L506.11,130.03 L506.74,130.82 L507.12,131.65 L507.27,132.5 L507.27,167.5 L507.16,168.35 L506.8,169.18 L506.2,169.97 L505.38,170.7 L504.35,171.35 L447.15,202.15 L445.94,202.71 L444.58,203.15 L443.11,203.48 L441.55,203.68 L439.96,203.75 L438.36,203.68 L436.79,203.48 L435.31,203.15 L433.93,202.71 L432.7,202.15 L374.3,171.35 L373.25,170.7 L372.39,169.97 L371.76,169.18 L371.38,168.35 L371.23,167.5 Z"
          fill={`url(#${p}-cb2)`}
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M504.2,128.65 L505.25,129.3 L506.11,130.03 L506.73,130.82 L507.13,131.65 L507.27,132.5 L507.16,133.35 L506.8,134.18 L506.2,134.97 L505.38,135.7 L504.35,136.35 L447.15,167.15 L445.94,167.7 L444.58,168.15 L443.11,168.48 L441.55,168.68 L439.96,168.74 L438.36,168.68 L436.79,168.48 L435.31,168.15 L433.93,167.7 L432.7,167.15 L374.3,136.35 L373.25,135.7 L372.39,134.97 L371.77,134.18 L371.37,133.35 L371.23,132.5 L371.34,131.65 L371.7,130.82 L372.3,130.03 L373.12,129.3 L374.15,128.65 L431.35,97.85 L432.56,97.3 L433.92,96.85 L435.39,96.52 L436.95,96.32 L438.54,96.26 L440.14,96.32 L441.71,96.52 L443.19,96.85 L444.57,97.3 L445.8,97.85 Z"
          fill="#fcfbf8"
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M504.2,158.65 L505.25,159.3 L506.11,160.03 L506.73,160.82 L507.13,161.65 L507.27,162.5 L507.16,163.35 L506.8,164.18 L506.2,164.97 L505.38,165.7 L504.35,166.35 L447.15,197.15 L445.94,197.7 L444.58,198.15 L443.11,198.48 L441.55,198.68 L439.96,198.74 L438.36,198.68 L436.79,198.48 L435.31,198.15 L433.93,197.7 L432.7,197.15 L374.3,166.35 L373.25,165.7 L372.39,164.97 L371.77,164.18 L371.37,163.35 L371.23,162.5 L371.34,161.65 L371.7,160.82 L372.3,160.03 L373.12,159.3 L374.15,158.65 L431.35,127.85 L432.56,127.3 L433.92,126.85 L435.39,126.52 L436.95,126.32 L438.54,126.26 L440.14,126.32 L441.71,126.52 L443.19,126.85 L444.57,127.3 L445.8,127.85"
          fill="none"
          stroke="#b8ad9b"
          strokeWidth="0.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0"
        />
        <path
          d="M371.23,127 L371.34,126.15 L371.7,125.32 L372.3,124.53 L373.12,123.8 L374.15,123.15 L431.35,92.35 L432.56,91.8 L433.92,91.35 L435.39,91.02 L436.95,90.82 L438.54,90.75 L440.14,90.82 L441.71,91.02 L443.19,91.35 L444.57,91.8 L445.8,92.35 L504.2,123.15 L505.25,123.8 L506.11,124.53 L506.74,125.32 L507.12,126.15 L507.27,127 L507.27,132.5 L507.16,133.35 L506.8,134.18 L506.2,134.97 L505.38,135.7 L504.35,136.35 L447.15,167.15 L445.94,167.71 L444.58,168.15 L443.11,168.48 L441.55,168.68 L439.96,168.75 L438.36,168.68 L436.79,168.48 L435.31,168.15 L433.93,167.71 L432.7,167.15 L374.3,136.35 L373.25,135.7 L372.39,134.97 L371.76,134.18 L371.38,133.35 L371.23,132.5 Z"
          fill={`url(#${p}-cb3)`}
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M504.2,123.15 L505.25,123.8 L506.11,124.53 L506.73,125.32 L507.13,126.15 L507.27,127 L507.16,127.85 L506.8,128.68 L506.2,129.47 L505.38,130.2 L504.35,130.85 L447.15,161.65 L445.94,162.2 L444.58,162.65 L443.11,162.98 L441.55,163.18 L439.96,163.24 L438.36,163.18 L436.79,162.98 L435.31,162.65 L433.93,162.2 L432.7,161.65 L374.3,130.85 L373.25,130.2 L372.39,129.47 L371.77,128.68 L371.37,127.85 L371.23,127 L371.34,126.15 L371.7,125.32 L372.3,124.53 L373.12,123.8 L374.15,123.15 L431.35,92.35 L432.56,91.8 L433.92,91.35 L435.39,91.02 L436.95,90.82 L438.54,90.76 L440.14,90.82 L441.71,91.02 L443.19,91.35 L444.57,91.8 L445.8,92.35 Z"
          fill="#2496f8"
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M494.11,124.31 L494.85,124.76 L495.44,125.27 L495.88,125.82 L496.16,126.4 L496.25,127 L496.18,127.6 L495.93,128.18 L495.51,128.73 L494.93,129.24 L494.21,129.69 L444.88,156.26 L444.03,156.65 L443.08,156.96 L442.05,157.19 L440.96,157.33 L439.84,157.38 L438.72,157.33 L437.63,157.19 L436.59,156.96 L435.62,156.65 L434.76,156.26 L384.39,129.69 L383.65,129.24 L383.06,128.73 L382.62,128.18 L382.34,127.6 L382.25,127 L382.32,126.4 L382.57,125.82 L382.99,125.27 L383.57,124.76 L384.29,124.31 L433.62,97.74 L434.47,97.35 L435.42,97.04 L436.45,96.81 L437.54,96.67 L438.66,96.62 L439.78,96.67 L440.87,96.81 L441.91,97.04 L442.88,97.35 L443.74,97.74 Z"
          fill="#121212"
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <g clipPath={`url(#${p}-cb4)`}>
          <path
            d="M494.11,128.31 L494.85,128.76 L495.44,129.27 L495.88,129.82 L496.16,130.4 L496.25,131 L496.18,131.6 L495.93,132.18 L495.51,132.73 L494.93,133.24 L494.21,133.69 L444.88,160.26 L444.03,160.65 L443.08,160.96 L442.05,161.19 L440.96,161.33 L439.84,161.38 L438.72,161.33 L437.63,161.19 L436.59,160.96 L435.62,160.65 L434.76,160.26 L384.39,133.69 L383.65,133.24 L383.06,132.73 L382.62,132.18 L382.34,131.6 L382.25,131 L382.32,130.4 L382.57,129.82 L382.99,129.27 L383.57,128.76 L384.29,128.31 L433.62,101.74 L434.47,101.35 L435.42,101.04 L436.45,100.81 L437.54,100.67 L438.66,100.62 L439.78,100.67 L440.87,100.81 L441.91,101.04 L442.88,101.35 L443.74,101.74 Z"
            fill={`url(#${p}-cb5)`}
          />
          <path
            d="M418,140 L470,112 L500,124 L452,156 Z"
            fill="#b7c4d6"
            opacity=".55"
            filter={`url(#${p}-cb6)`}
          />
        </g>
        <path
          d="M494.11,124.31 L494.85,124.76 L495.44,125.27 L495.88,125.82 L496.16,126.4 L496.25,127 L496.18,127.6 L495.93,128.18 L495.51,128.73 L494.93,129.24 L494.21,129.69 L444.88,156.26 L444.03,156.65 L443.08,156.96 L442.05,157.19 L440.96,157.33 L439.84,157.38 L438.72,157.33 L437.63,157.19 L436.59,156.96 L435.62,156.65 L434.76,156.26 L384.39,129.69 L383.65,129.24 L383.06,128.73 L382.62,128.18 L382.34,127.6 L382.25,127 L382.32,126.4 L382.57,125.82 L382.99,125.27 L383.57,124.76 L384.29,124.31 L433.62,97.74 L434.47,97.35 L435.42,97.04 L436.45,96.81 L437.54,96.67 L438.66,96.62 L439.78,96.67 L440.87,96.81 L441.91,97.04 L442.88,97.35 L443.74,97.74 Z"
          fill="none"
          stroke="#121212"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M372.11,145.69 L375.61,147.54 L375.61,151.74 L372.11,149.89 Z"
          fill="#2a8ff5"
        />
        <path
          d="M379.77,149.74 L383.28,151.59 L383.28,155.79 L379.77,153.94 Z"
          fill="#2a8ff5"
        />
        <path
          d="M387.44,153.78 L390.94,155.63 L390.94,159.83 L387.44,157.98 Z"
          fill="#2a8ff5"
        />
        <path
          d="M395.11,157.82 L398.61,159.67 L398.61,163.87 L395.11,162.02 Z"
          fill="#2a8ff5"
        />
        <path
          d="M412.26,156.87 L412.26,166.37 L415.55,171.1 L415.55,192.1"
          fill="none"
          stroke="#121212"
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M499.35,139.54 L499.35,148.04 L501.85,149.7 L501.85,171.7"
          fill="none"
          stroke="#121212"
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M501.85,139.7 L501.85,171.2 L507.21,167.31 L507.21,136.81 Z"
          fill="#b7a991"
          opacity=".6"
        />
        <path
          d="M458.59,180.49 L470.03,174.33 L470.03,180.33 L458.59,186.49 Z"
          fill="#121212"
          stroke="#121212"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M460.02,181.22 L467.88,176.99"
          fill="none"
          stroke="#555"
          strokeWidth="0.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Float lift={8}>
          <path
            d="M389,57 L414.25,71 L414.25,100.5 L389,86.5 Z"
            fill="#ece8e0"
            stroke="#121212"
            strokeWidth="1.25"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M389,86.5 L414.25,100.5 L414.25,130 L389,116 Z"
            fill="#e9e4db"
            stroke="#121212"
            strokeWidth="1.25"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M414.25,71 L439.5,85 L439.5,114.5 L414.25,100.5 Z"
            fill={`url(#${p}-cb7)`}
            stroke="#121212"
            strokeWidth="1.25"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M414.25,100.5 L439.5,114.5 L439.5,144 L414.25,130 Z"
            fill={`url(#${p}-cb9)`}
            stroke="#121212"
            strokeWidth="1.25"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M488,57 L463.75,71 L463.75,100.5 L488,86.5 Z"
            fill="#0d0d0d"
            stroke="#121212"
            strokeWidth="1.25"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M488,86.5 L463.75,100.5 L463.75,130 L488,116 Z"
            fill="#0d0d0d"
            stroke="#121212"
            strokeWidth="1.25"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M463.75,71 L439.5,85 L439.5,114.5 L463.75,100.5 Z"
            fill={`url(#${p}-cb8)`}
            stroke="#121212"
            strokeWidth="1.25"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M463.75,100.5 L439.5,114.5 L439.5,144 L463.75,130 Z"
            fill="#0d0d0d"
            stroke="#121212"
            strokeWidth="1.25"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M437.5,29 L462.75,43 L438.5,57 L413.25,43 Z"
            fill="#fefdfb"
            stroke="#121212"
            strokeWidth="1.25"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M413.25,43 L438.5,57 L414.25,71 L389,57 Z"
            fill="#fefdfb"
            stroke="#121212"
            strokeWidth="1.25"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M462.75,43 L488,57 L463.75,71 L438.5,57 Z"
            fill="#fefdfb"
            stroke="#121212"
            strokeWidth="1.25"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M438.5,57 L463.75,71 L439.5,85 L414.25,71 Z"
            fill="#fbfcfe"
            stroke="#121212"
            strokeWidth="1.25"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M414.25,100 L439.5,114 L463.75,100"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity=".8"
          />
          <path
            d="M488,86 L463.75,100"
            fill="none"
            stroke="#f2f2f2"
            strokeWidth="1.3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M463.75,101 L463.75,126"
            fill="none"
            stroke="#f2f2f2"
            strokeWidth="1.3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M437.5,29 L488,57 L488,116 L439.5,144 L389,116 L389,57 Z"
            fill="none"
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

// Chunky padlock; the shackle lifts open while live (user-supplied art).
