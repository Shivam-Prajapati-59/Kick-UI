/**
 * SEO regression suite — metadata, OG images, structured data, sitemap.
 * Run: bun tests/e2e/seo.mjs [baseUrl]
 */

const BASE = process.argv[2] || "http://localhost:3000";
let passed = 0;
let failed = 0;

function assert(cond, label, extra) {
  if (cond) {
    passed++;
    console.log("  ✓ " + label);
  } else {
    failed++;
    console.log(
      "  ✗ " +
        label +
        (extra !== undefined ? " — " + String(extra).slice(0, 200) : ""),
    );
  }
}

async function html(path) {
  const r = await fetch(BASE + path);
  return { status: r.status, text: await r.text() };
}

(async () => {
  console.log("\nSEO regression — home page:");
  let h = await html("/");
  assert(h.status === 200, "/ returns 200");
  assert(
    h.text.includes(
      "<title>Kick UI — Beautifully animated UI components for React</title>",
    ),
    "default title with tagline",
  );
  assert(h.text.includes("og:title"), "og:title present");
  assert(h.text.includes('og:type" content="website'), "og:type website");
  assert(
    h.text.includes("https://kick-ui.vercel.app"),
    "absolute og:url / metadataBase applied",
  );
  assert(
    h.text.includes('twitter:card" content="summary_large_image'),
    "twitter card large",
  );
  assert(h.text.includes('rel="canonical"'), "canonical link present");
  assert(h.text.includes("application/ld+json"), "JSON-LD present");
  assert(
    h.text.includes('"@type":"WebSite"') &&
      h.text.includes('"@type":"Organization"'),
    "WebSite + Organization schema",
  );
  assert(
    h.text.includes("max-image-preview"),
    "googleBot max-image-preview directive",
  );

  console.log("\nSEO regression — component page:");
  h = await html("/components/timeframe-tabs");
  assert(h.status === 200, "component page 200");
  assert(
    h.text.includes("<title>Timeframe Tabs | Kick UI</title>"),
    "templated title",
  );
  assert(h.text.includes('og:type" content="article'), "og:type article");
  assert(
    h.text.includes('href="/components/timeframe-tabs"'),
    "canonical to component path",
  );
  assert(
    h.text.includes('"@type":"SoftwareApplication"'),
    "SoftwareApplication schema",
  );
  assert(h.text.includes('"@type":"BreadcrumbList"'), "BreadcrumbList schema");

  console.log("\nOG image routes:");
  let r = await fetch(`${BASE}/components/timeframe-tabs/opengraph-image`);
  assert(r.status === 200, "component OG image 200", r.status);
  assert(
    (r.headers.get("content-type") || "").includes("image/png"),
    "component OG image is PNG",
    r.headers.get("content-type"),
  );
  const buf = Buffer.from(await r.arrayBuffer());
  assert(
    buf.length > 10000,
    `OG image has real content (${Math.round(buf.length / 1024)}KB)`,
  );
  r = await fetch(`${BASE}/opengraph-image`);
  assert(
    r.status === 200 &&
      (r.headers.get("content-type") || "").includes("image/png"),
    "root OG image 200 PNG",
  );

  console.log("\nSitemap & robots:");
  const sm = await html("/sitemap.xml");
  assert(sm.status === 200, "sitemap 200");
  const componentUrls = (sm.text.match(/\/components\/[a-z-]+<\/loc>/g) || [])
    .length;
  assert(
    componentUrls === 15,
    "sitemap lists all 15 components",
    componentUrls,
  );
  const rb = await html("/robots.txt");
  assert(
    rb.text.includes("Sitemap: https://kick-ui.vercel.app/sitemap.xml"),
    "robots references sitemap",
  );

  console.log("\nNoindex hygiene:");
  const pg = await html("/playground");
  assert(pg.text.includes("noindex"), "playground is noindex");

  console.log("\n══════════════════════════════");
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  process.exitCode = failed > 0 ? 1 : 0;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
