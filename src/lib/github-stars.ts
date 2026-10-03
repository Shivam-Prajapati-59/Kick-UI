import { SITE_CONFIG } from "@/lib/site-config";

/**
 * GitHub star count, fetched at build/revalidate time.
 *
 * Derived from SITE_CONFIG.github so the repo can never drift from the link
 * rendered next to it — the same rule `registry-check` enforces between
 * registry.json and site-config.
 *
 * Returns null on any failure (offline build, rate limit, renamed repo).
 * Callers must treat null as "unknown" and hide the badge rather than
 * rendering a wrong or zero count.
 */

const REVALIDATE_SECONDS = 60 * 60; // hourly; stars move slowly

/** `owner/repo` extracted from the canonical GitHub URL in site-config. */
function repoSlug(): string | null {
  const match = SITE_CONFIG.github.match(
    /^https?:\/\/github\.com\/([^/]+\/[^/]+)/,
  );
  return match ? match[1].replace(/\.git$/, "") : null;
}

export async function getGithubStars(): Promise<number | null> {
  const slug = repoSlug();
  if (!slug) return null;

  try {
    const response = await fetch(`https://api.github.com/repos/${slug}`, {
      // Unauthenticated API calls are rate-limited per IP; Next's data cache
      // keeps this to one request per revalidate window instead of per render.
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: "application/vnd.github+json" },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { stargazers_count?: unknown };
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    // A failed star count must never take the navbar — or the build — down.
    return null;
  }
}

/** Compact display form: 1234 -> "1.2k", 999 -> "999". */
export function formatStarCount(stars: number): string {
  if (stars < 1000) return String(stars);
  const thousands = stars / 1000;
  return `${thousands >= 10 ? Math.round(thousands) : Number(thousands.toFixed(1))}k`;
}
