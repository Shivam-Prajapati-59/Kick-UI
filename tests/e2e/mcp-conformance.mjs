/**
 * Kick UI MCP server — raw JSON-RPC conformance regression suite.
 * Run: bun tests/e2e/mcp-conformance.mjs [baseUrl]
 */

const BASE = process.argv[2] || "http://localhost:3000";
const URL_ENDPOINT = `${BASE}/api/mcp`;

let passed = 0;
let failed = 0;

function assert(condition, label, extra) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.error(
      `  ✗ ${label}${extra ? ` — ${JSON.stringify(extra).slice(0, 300)}` : ""}`,
    );
  }
}

async function post(body, headers = {}) {
  const res = await fetch(URL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Post-initialization requests declare the negotiated protocol version.
      ...protocolHeaders,
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  // Read the raw body exactly once; parse JSON only when non-empty so a
  // 202-with-body bug can never be masked by a fabricated empty string.
  const text = await res.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {}
  }
  return { status: res.status, json, text, headers: res.headers };
}

let protocolHeaders = {};

console.log(`\nMCP conformance suite → ${URL_ENDPOINT}\n`);

// ── 1. initialize ──
{
  const { status, json } = await post({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "conformance", version: "1.0" },
    },
  });
  assert(status === 200, "initialize returns 200");
  assert(
    json?.result?.serverInfo?.name === "kick-ui",
    "initialize serverInfo.name === kick-ui",
  );
  assert(
    !!json?.result?.capabilities?.tools,
    "initialize advertises tools capability",
  );
  assert(
    typeof json?.result?.protocolVersion === "string",
    "initialize returns protocolVersion",
  );
}

// ── 2. initialized notification ──
{
  const { status } = await post({
    jsonrpc: "2.0",
    method: "notifications/initialized",
  });
  assert(status === 202, "notifications/initialized returns 202");
}

// ── 2b. Protocol version header gate (post-initialization) ──
{
  protocolHeaders = { "Mcp-Protocol-Version": "2025-06-18" };
  const { status, json } = await post({
    jsonrpc: "2.0",
    id: "pv1",
    method: "ping",
  });
  assert(
    status === 200 && json?.result,
    "supported version 2025-06-18 accepted",
  );

  protocolHeaders = { "Mcp-Protocol-Version": "2025-03-26" };
  const legacy = await post({ jsonrpc: "2.0", id: "pv2", method: "ping" });
  assert(
    legacy.status === 200 && legacy.json?.result,
    "legacy fallback 2025-03-26 accepted",
  );

  protocolHeaders = { "Mcp-Protocol-Version": "1999-01-01" };
  const rejected = await fetch(URL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...protocolHeaders },
    body: JSON.stringify({ jsonrpc: "2.0", id: "pv3", method: "ping" }),
  });
  assert(
    rejected.status === 400,
    "unsupported version rejected with HTTP 400",
    rejected.status,
  );
  const errBody = await rejected.json();
  assert(
    errBody?.error?.message?.includes("Supported versions"),
    "rejection explains supported versions",
  );

  protocolHeaders = {};
  const noHeader = await post({ jsonrpc: "2.0", id: "pv4", method: "ping" });
  assert(noHeader.status === 200, "absent header still allowed");
}

// ── 3. ping ──
{
  const { status, json } = await post({
    jsonrpc: "2.0",
    id: 2,
    method: "ping",
  });
  assert(
    status === 200 && json?.result && !json?.error,
    "ping returns empty result",
  );
}

// ── 4. tools/list ──
let tools;
{
  const { status, json } = await post({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/list",
  });
  tools = json?.result?.tools ?? [];
  const names = tools.map((t) => t.name);
  assert(status === 200, "tools/list returns 200");
  assert(names.length === 4, "exposes exactly 4 tools", names);
  for (const expected of [
    "list_components",
    "search_components",
    "get_component",
    "get_install_guide",
  ]) {
    assert(names.includes(expected), `tool present: ${expected}`);
  }
  assert(
    tools.every((t) => t.inputSchema?.type === "object"),
    "all tools declare object inputSchema",
  );
  assert(
    tools.every(
      (t) => typeof t.description === "string" && t.description.length > 20,
    ),
    "all tools have meaningful descriptions",
  );
}

// ── 5. list_components ──
{
  const { json } = await post({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: { name: "list_components", arguments: {} },
  });
  const text = json?.result?.content?.[0]?.text ?? "";
  assert(json?.result && !json?.result?.isError, "list_components succeeds");
  assert(
    text.includes("15 component(s)"),
    "lists 15 components",
    text.slice(0, 120),
  );
  assert(
    text.includes("feature-showcase") && text.includes("timeframe-tabs"),
    "includes newest components",
  );
}
{
  const { json } = await post({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: { name: "list_components", arguments: { category: "buttons" } },
  });
  const text = json?.result?.content?.[0]?.text ?? "";
  assert(
    text.includes("shiny-button") && text.includes("slide-text-button"),
    "category filter works",
  );
}
{
  const { json } = await post({
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: { name: "list_components", arguments: { category: "nope" } },
  });
  assert(json?.result?.isError === true, "invalid category -> isError content");
}

// ── 6. search_components ──
{
  const { json } = await post({
    jsonrpc: "2.0",
    id: 7,
    method: "tools/call",
    params: { name: "search_components", arguments: { query: "button" } },
  });
  const text = json?.result?.content?.[0]?.text ?? "";
  const firstResult = text.split("\n").find((l) => l.startsWith("- "));
  assert(text.includes("shiny-button"), 'search "button" finds shiny-button');
  assert(
    firstResult?.includes("shiny-button"),
    "search ranks exact name match first",
    firstResult,
  );
}
{
  const { json } = await post({
    jsonrpc: "2.0",
    id: 8,
    method: "tools/call",
    params: { name: "search_components", arguments: { query: "carousel" } },
  });
  const text = json?.result?.content?.[0]?.text ?? "";
  assert(
    text.includes("stacked-carousel"),
    'search "carousel" finds stacked-carousel',
  );
}
{
  const { json } = await post({
    jsonrpc: "2.0",
    id: 9,
    method: "tools/call",
    params: { name: "search_components", arguments: {} },
  });
  assert(
    json?.error?.code === -32602,
    "missing query -> -32602 invalid params",
  );
}

// ── 7. get_component deep checks ──
{
  const { json } = await post({
    jsonrpc: "2.0",
    id: 10,
    method: "tools/call",
    params: { name: "get_component", arguments: { name: "timeframe-tabs" } },
  });
  const text = json?.result?.content?.[0]?.text ?? "";
  assert(!json?.result?.isError, "get_component succeeds");
  assert(
    text.includes(
      "npx shadcn@latest add https://kick-ui.vercel.app/r/timeframe-tabs.json",
    ),
    "returns working install command",
  );
  assert(
    text.includes("```tsx") && text.length > 3000,
    "embeds full source code",
  );
  assert(text.toLowerCase().includes("prop"), "includes props section");
  assert(text.includes("motion"), "declares npm dependencies");
}
{
  const { json } = await post({
    jsonrpc: "2.0",
    id: 11,
    method: "tools/call",
    params: { name: "get_component", arguments: { name: "shiny-button" } },
  });
  const text = json?.result?.content?.[0]?.text ?? "";
  assert(
    /registry dependencies/i.test(text) && /(^|\W)button(\W|$)/m.test(text),
    "shiny-button reports registry dependency on shadcn button",
  );
}
{
  const { json } = await post({
    jsonrpc: "2.0",
    id: 12,
    method: "tools/call",
    params: { name: "get_component", arguments: { name: "does-not-exist" } },
  });
  assert(
    json?.result?.isError === true &&
      json?.result?.content?.[0]?.text.includes("Valid names"),
    "unknown component -> helpful isError message",
  );
}

// ── 8. get_install_guide ──
{
  const { json } = await post({
    jsonrpc: "2.0",
    id: 13,
    method: "tools/call",
    params: { name: "get_install_guide", arguments: {} },
  });
  const text = json?.result?.content?.[0]?.text ?? "";
  assert(
    text.includes("@kick-ui") && text.includes("{name}.json"),
    "install guide covers namespace setup",
  );
}

// ── 9. protocol errors ──
{
  const { json } = await post({
    jsonrpc: "2.0",
    id: 14,
    method: "resources/list",
  });
  assert(json?.error?.code === -32601, "unknown method -> -32601");
}
{
  const { json } = await post({ jsonrpc: "1.0", id: 15, method: "ping" });
  assert(json?.error?.code === -32600, "wrong jsonrpc version -> -32600");
}
{
  const { status, json } = await post("this is not json{{{");
  assert(json?.error?.code === -32700, "malformed JSON -> -32700 parse error");
  assert(status === 200, "parse error still HTTP 200 (JSON-RPC over HTTP)");
}
{
  const { json } = await post({
    jsonrpc: "2.0",
    id: 16,
    method: "tools/call",
    params: { name: "nonexistent_tool", arguments: {} },
  });
  assert(json?.error?.code === -32602, "unknown tool -> -32602");
}
{
  const { json } = await post({
    jsonrpc: "2.0",
    id: 17,
    method: "tools/call",
    params: { name: "get_component", arguments: { bogus: true } },
  });
  assert(json?.error?.code === -32602, "unknown argument rejected");
}

// ── 10. transport behavior ──
{
  const res = await fetch(URL_ENDPOINT);
  assert(res.status === 405, "GET probe returns 405 per Streamable HTTP spec");
  const optionsRes = await fetch(URL_ENDPOINT, { method: "OPTIONS" });
  assert(optionsRes.status === 204, "OPTIONS preflight returns 204");
  assert(
    optionsRes.headers.get("access-control-allow-origin") === "*",
    "CORS allows all origins",
  );
  const postRes = await fetch(URL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://some-agent.example",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 99, method: "ping" }),
  });
  assert(
    postRes.headers.get("access-control-allow-origin") === "*",
    "POST echoes CORS for foreign origins",
  );
}
{
  // Notification must NOT return a body.
  const res = await fetch(URL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    }),
  });
  const text = await res.text();
  assert(
    res.status === 202 && text === "",
    "notification returns empty 202 body",
  );
}

// ── 11. Notification semantics for request-shaped methods ──
{
  // ping without id = notification → 202, no body.
  const pingRes = await post({ jsonrpc: "2.0", method: "ping" });
  assert(
    pingRes.status === 202 && pingRes.text === "",
    "ping-as-notification returns empty 202",
    pingRes.text,
  );
}
{
  // tools/call without id executes silently → 202, no body.
  const callRes = await post({
    jsonrpc: "2.0",
    method: "tools/call",
    params: { name: "list_components", arguments: {} },
  });
  assert(
    callRes.status === 202 && callRes.text === "",
    "tools/call-as-notification returns empty 202",
    callRes.text,
  );
}
{
  // Explicit id:null is still a request → normal response with body.
  const { status, json } = await post({
    jsonrpc: "2.0",
    id: null,
    method: "ping",
  });
  assert(
    status === 200 && json?.result !== undefined && json.id === null,
    "explicit id:null receives a normal response",
  );
}
{
  // Even error paths collapse to 202 for notifications (no reply allowed).
  const errRes = await post({ jsonrpc: "2.0", method: "resources/list" });
  assert(
    errRes.status === 202 && errRes.text === "",
    "unknown-method notification returns empty 202",
    errRes.text,
  );
}

console.log(`\n══════════════════════════════`);
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
