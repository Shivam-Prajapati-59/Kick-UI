/**
 * Final end-to-end audit — routes, metadata quality, OG images for ALL
 * components, sitemap crawl, JSON-LD validity, and registry sanity.
 * Run: bun tests/e2e/final-audit.mjs [baseUrl]
 */

const BASE = process.argv[2] || "http://localhost:3000";
let passed = 0;
let failed = 0;
const issues = [];

function assert(cond, label, extra) {
  if (cond) {
    passed++;
    console.log("  ✓ " + label);
  } else {
    failed++;
    console.log(
      "  ✗ " +
        label +
        (extra !== undefined ? " — " + String(extra).slice(0, 220) : ""),
    );
    issues.push(label);
  }
}

function metaTags(html) {
  const tags = {};
  const re = /<meta\s+([^>]*?)\/?>/g;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1];
    const prop = /(?:property|name)="([^"]+)"/.exec(tag)?.[1];
    const content = /content="([^"]*)"/.exec(tag)?.[1];
    if (prop && content !== undefined && !(prop in tags)) tags[prop] = content;
  }
  return tags;
}

(async () => {
  // ── 1. All routes return 200 ──
  console.log("\n[Routes]");
  const routes = [
    "/",
    "/components",
    "/docs",
    "/playground",
    "/sitemap.xml",
    "/robots.txt",
  ];
  const slugs = [
    "animated-list",
    "card-stack",
    "cursor-web-fluid",
    "feature-showcase",
    "mag-dock",
    "perspective-grid",
    "pill-card",
    "pixel-image",
    "scramble-text",
    "scroll-card",
    "shiny-button",
    "slide-text-button",
    "stacked-carousel",
    "text-focus",
    "timeframe-tabs",
  ];
  for (const s of slugs) routes.push(`/components/${s}`);
  let allOk = true;
  for (const r of routes) {
    const res = await fetch(BASE + r);
    if (res.status !== 200) {
      allOk = false;
      assert(false, `route ${r}`, res.status);
    }
  }
  assert(allOk, `all ${routes.length} routes return 200`);

  // ── 2. Metadata quality on key pages ──
  // Canonicals resolve through metadataBase to the production domain.
  const PROD = "https://kick-ui.vercel.app";
  console.log("\n[Metadata quality]");
  for (const [path, expectTitle] of [
    ["/", "Kick UI — Beautifully animated UI components for React"],
    ["/components", "Components | Kick UI"],
    ["/docs", "Docs | Kick UI"],
    ["/components/timeframe-tabs", "Timeframe Tabs | Kick UI"],
  ]) {
    const { text } = await html(path);
    const title = /<title>([^<]+)<\/title>/.exec(text)?.[1];
    assert(title === expectTitle, `${path} title = "${expectTitle}"`, title);
    assert(
      typeof title === "string" && title.length <= 65,
      `${path} title length OK (${title?.length ?? "missing"})`,
    );
    const desc = /<meta name="description" content="([^"]+)"/.exec(text)?.[1];
    assert(
      !!desc && desc.length >= 70 && desc.length <= 185,
      `${path} description length ${desc?.length}`,
    );
    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(text)?.[1];
    // Next resolves the root "/" canonical to the bare origin; both forms
    // are equivalent for crawlers, so accept either.
    const accepted = path === "/" ? [`${PROD}/`, PROD] : [PROD + path];
    assert(
      canonical !== undefined && accepted.includes(canonical),
      `${path} canonical correct`,
      canonical,
    );
  }

  // ── 3. Full head audit on a component page ──
  console.log("\n[Head audit — component page]");
  {
    const { text } = await html("/components/pill-card");
    const t = metaTags(text);
    assert(t["og:title"] === "Pill Card — Kick UI", "og:title", t["og:title"]);
    assert(t["og:description"]?.length > 20, "og:description present");
    assert(t["og:type"] === "article", "og:type article");
    assert(t["og:site_name"] === "Kick UI", "og:site_name");
    assert(
      (t["og:image"] || "").length > 0,
      "og:image emitted from file convention",
      t["og:image"],
    );
    assert(t["twitter:card"] === "summary_large_image", "twitter:card");
    assert(t["twitter:title"]?.includes("Pill Card"), "twitter:title");
    assert(
      /index, follow|all/.test(t["robots"] || ""),
      "robots index,follow",
      t["robots"],
    );

    // JSON-LD must parse as valid JSON with the right graph types.
    const ldMatch =
      /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(text);
    try {
      const ld = JSON.parse(ldMatch[1]);
      const types = (ld["@graph"] || []).map((n) => n["@type"]);
      assert(
        types.includes("SoftwareApplication"),
        "JSON-LD valid, has SoftwareApplication",
        types.join(","),
      );
      assert(types.includes("BreadcrumbList"), "JSON-LD has BreadcrumbList");
    } catch (e) {
      assert(
        false,
        "component JSON-LD parses as valid JSON",
        String(e).slice(0, 80),
      );
    }
  }

  // ── 4. Home page JSON-LD validity ──
  {
    const { text } = await html("/");
    const ldMatch =
      /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(text);
    try {
      const ld = JSON.parse(ldMatch[1]);
      const types = (ld["@graph"] || []).map((n) => n["@type"]);
      assert(
        types.includes("WebSite") && types.includes("Organization"),
        "home JSON-LD WebSite + Organization",
        types.join(","),
      );
    } catch (e) {
      assert(
        false,
        "home JSON-LD parses as valid JSON",
        String(e).slice(0, 80),
      );
    }
  }

  // ── 5. Per-component OG images — ALL 15 ──
  console.log("\n[OG images — every component]");
  let ogOk = 0;
  for (const s of slugs) {
    const res = await fetch(`${BASE}/components/${s}/opengraph-image`);
    const okHttp = res.status === 200;
    const isPng = (res.headers.get("content-type") || "").includes("image/png");
    const size = Buffer.from(await res.arrayBuffer()).length;
    const big = size > 8000;
    if (okHttp && isPng && big) ogOk++;
    else assert(false, `OG image ${s}`, `${res.status} ${size}b`);
  }
  assert(ogOk === 15, `all 15 component OG images render (${ogOk}/15)`);

  // ── 6. Sitemap crawl — every URL must resolve ──
  console.log("\n[Sitemap crawl]");
  const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert(urls.length >= 19, `sitemap has ${urls.length} URLs (19+ expected)`);
  let deadUrls = 0;
  for (const u of urls) {
    const local = u.replace("https://kick-ui.vercel.app", BASE);
    const res = await fetch(local);
    if (res.status !== 200) {
      deadUrls++;
      assert(false, `sitemap URL dead: ${u}`, res.status);
    }
  }
  assert(deadUrls === 0, "every sitemap URL resolves 200");

  // ── 7. Registry endpoints sanity ──
  console.log("\n[Registry endpoints]");
  const idx = await (await fetch(`${BASE}/r/registry.json`)).json();
  assert(idx.items?.length === 15, "/r/registry.json lists 15 items");
  const one = await (await fetch(`${BASE}/r/shiny-button.json`)).json();
  assert(
    one.$schema?.includes("registry-item.json"),
    "item JSON carries schema ref",
  );
  assert(
    one.files?.[0]?.content?.includes("ShinyButton"),
    "item JSON embeds source",
  );
  assert(one.dependencies?.includes("motion"), "item JSON declares deps");

  console.log("\n══════════════════════════════");
  console.log(`FINAL AUDIT: ${passed} passed, ${failed} failed`);
  if (issues.length) console.log("Issues:\n - " + issues.join("\n - "));
  process.exitCode = failed > 0 ? 1 : 0;

  async function html(path) {
    const r = await fetch(BASE + path);
    return { status: r.status, text: await r.text() };
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
