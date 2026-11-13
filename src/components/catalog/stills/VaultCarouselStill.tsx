// Static catalog thumbnail: mirrors the vault carousel's cards without motion.
const INK = "#1b1d29";
const BLUE = "#1490f7";
const BLUE_DEEP = "#0c74de";
const BLUE_LIGHT = "#2a9dfc";
const BLACK = "#15161c";
const CREAM = "#fbfaf7";
const CREAM_LIGHT = "#f1ede6";
const CREAM_DARK = "#d9d2c4";
const GROUND = "#a6c6ef";

export function VaultCarouselStill() {
  return (
    <div
      className="flex size-full items-center justify-center gap-2 p-3"
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`relative rounded-2xl bg-[#f1efe9] shadow-[0_8px_20px_-10px_rgba(20,30,50,0.35)] dark:bg-[#262b37] ${
            i === 1
              ? "h-[116px] w-[93px] shadow-[0_10px_26px_-10px_rgba(20,30,50,0.5)]"
              : "h-[96px] w-[77px]"
          }`}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.9),transparent_65%)] dark:bg-[radial-gradient(circle_at_50%_40%,rgba(96,140,210,0.30),transparent_65%)]"
          />
          <svg viewBox="0 0 100 100" className="relative size-full p-2">
            {i === 0 && (
              <>
                <ellipse
                  cx="56"
                  cy="84"
                  rx="26"
                  ry="6"
                  fill={GROUND}
                  opacity="0.55"
                />
                <polygon points="26,58 50,70 50,82 26,70" fill={CREAM_LIGHT} />
                <polygon points="74,58 50,70 50,82 74,70" fill={CREAM_DARK} />
                <polygon points="26,54 50,66 50,70 26,58" fill={BLUE} />
                <polygon points="74,54 50,66 50,70 74,58" fill={BLUE_DEEP} />
                <polygon points="26,40 50,52 50,66 26,54" fill={CREAM_LIGHT} />
                <polygon points="74,40 50,52 50,66 74,54" fill={CREAM_DARK} />
                <polygon points="50,28 74,40 50,52 26,40" fill={CREAM} />
                <ellipse cx="50" cy="40" rx="12" ry="5.5" fill={BLUE} />
                <path
                  d="M50 12 L61 16 V28 C61 34 56 38 50 41 C44 38 39 34 39 28 V16 Z"
                  fill={CREAM}
                  stroke={INK}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M50 16 L57 19 V28 C57 32 54 35 50 37 C46 35 43 32 43 28 V19 Z"
                  fill={BLUE_LIGHT}
                />
              </>
            )}
            {i === 1 && (
              <>
                <ellipse
                  cx="56"
                  cy="86"
                  rx="28"
                  ry="6"
                  fill={GROUND}
                  opacity="0.55"
                />
                <path
                  d="M24 62 V78 A26 11 0 0 0 76 78 V62 Z"
                  fill={CREAM_LIGHT}
                />
                <path d="M68 76 A26 11 0 0 0 76 74 V62 L70 63 Z" fill={BLACK} />
                <path
                  d="M24 70 A26 11 0 0 0 76 70 V73 A26 11 0 0 1 24 73 Z"
                  fill={BLUE}
                />
                <ellipse cx="50" cy="62" rx="26" ry="11" fill={CREAM} />
                <ellipse cx="50" cy="62" rx="14" ry="5" fill="#d9e8fb" />
                <rect
                  x="40"
                  y="14"
                  width="20"
                  height="46"
                  rx="4"
                  fill={CREAM_LIGHT}
                  stroke={INK}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <rect
                  x="43"
                  y="18"
                  width="14"
                  height="38"
                  rx="2.5"
                  fill={BLUE}
                />
                <path
                  d="M46 38a4 4 0 0 1 8 0"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.2"
                />
                <path
                  d="M44 38a6 6 0 0 1 12 0"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.2"
                />
                <path
                  d="M42 38a8 8 0 0 1 16 0"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.2"
                />
                <circle cx="50" cy="40" r="1" fill="#fff" />
              </>
            )}
            {i === 2 && (
              <>
                <ellipse
                  cx="56"
                  cy="88"
                  rx="28"
                  ry="6"
                  fill={GROUND}
                  opacity="0.55"
                />
                <polygon points="50,66 80,80 50,94 20,80" fill={BLUE} />
                <polygon points="50,70 73,81 50,92 27,81" fill={CREAM_LIGHT} />
                <polygon points="20,80 50,94 50,99 20,85" fill={CREAM_LIGHT} />
                <polygon points="80,80 50,94 50,99 80,85" fill={CREAM_DARK} />
                <polygon points="50,16 74,28 50,40 26,28" fill={CREAM} />
                <polygon points="26,28 50,40 50,68 26,56" fill={CREAM_LIGHT} />
                <polygon points="74,28 50,40 50,68 74,56" fill={BLACK} />
                <path
                  d="M50 16V40M26 28H74"
                  stroke={INK}
                  strokeWidth="0.6"
                  opacity="0.6"
                  fill="none"
                />
                <path
                  d="M26 42L50 54M38 34L38 62"
                  stroke={INK}
                  strokeWidth="0.6"
                  opacity="0.6"
                  fill="none"
                />
                <polygon
                  points="38,48 50,54 50,68 38,62"
                  fill="#bcd6ff"
                  opacity="0.75"
                />
              </>
            )}
          </svg>
        </div>
      ))}
    </div>
  );
}
