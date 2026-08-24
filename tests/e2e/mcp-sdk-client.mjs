/**
 * Kick UI MCP server — end-to-end regression via the OFFICIAL MCP SDK client.
 * Exercises a real protocol handshake (initialize + capability negotiation +
 * notifications) exactly as Claude Desktop, Cursor, or any MCP agent would.
 *
 * Run: bun tests/e2e/mcp-sdk-client.mjs [baseUrl]
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const BASE = process.argv[2] || "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, label, extra) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.error(
      `  ✗ ${label}${extra !== undefined ? ` — ${JSON.stringify(extra)?.slice(0, 300)}` : ""}`,
    );
  }
}

function textOf(result) {
  return result?.content?.map((c) => c.text).join("\n") ?? "";
}

console.log(`\nMCP SDK client E2E → ${BASE}/api/mcp\n`);

const transport = new StreamableHTTPClientTransport(new URL(`${BASE}/api/mcp`));
const client = new Client({
  name: "kick-ui-e2e-client",
  version: "1.0.0",
});

try {
  // ── 1. Real handshake ──
  await client.connect(transport);
  assert(
    client.getServerVersion()?.name === "kick-ui",
    "handshake: server is kick-ui",
    client.getServerVersion(),
  );
  assert(
    typeof client.getServerCapabilities()?.tools === "object",
    "handshake: tools capability negotiated",
  );
  assert(
    client.getInstructions()?.includes("shadcn"),
    "handshake: instructions delivered",
  );

  // ── 2. listTools through SDK validation ──
  const { tools } = await client.listTools();
  assert(tools.length === 4, "listTools returns 4 tools");
  const getComponent = tools.find((t) => t.name === "get_component");
  const enumNames = getComponent?.inputSchema?.properties?.name?.enum ?? [];
  assert(
    enumNames.length === 15,
    "get_component name enum lists all 15 components",
  );

  // ── 3. list_components call ──
  const listResult = await client.callTool({
    name: "list_components",
    arguments: {},
  });
  assert(listResult.isError !== true, "list_components call succeeds");
  assert(
    textOf(listResult).includes("15 component(s)"),
    "list_components shows full catalog",
  );

  // ── 4. search_components call ──
  const searchResult = await client.callTool({
    name: "search_components",
    arguments: { query: "text" },
  });
  const searchText = textOf(searchResult);
  assert(
    searchText.includes("scramble-text") && searchText.includes("text-focus"),
    'search "text" finds text components',
  );

  // ── 5. get_component deep inspection ──
  const detailResult = await client.callTool({
    name: "get_component",
    arguments: { name: "cursor-web-fluid" },
  });
  const detailText = textOf(detailResult);
  assert(
    detailText.includes("three"),
    "get_component declares three.js dependency",
  );
  assert(detailText.includes("use client"), "source code embedded");
  const installMatch = detailText.match(/npx shadcn@latest add (\S+)/);
  assert(!!installMatch, "install command extractable by agents");

  // ── 6. Install command actually resolves against the live registry ──
  if (installMatch) {
    const itemUrl = installMatch[1];
    const regRes = await fetch(itemUrl);
    assert(
      regRes.ok === true,
      `install URL resolves over HTTP: ${itemUrl}`,
      regRes.status,
    );
    const itemJson = await regRes.json();
    assert(itemJson.name === "cursor-web-fluid", "registry JSON payload valid");
    assert(
      Array.isArray(itemJson.files) && itemJson.files[0].content.length > 1000,
      "registry JSON embeds component source",
    );
  }

  // ── 7. Tool error surfaces as isError content (not protocol crash) ──
  const badResult = await client.callTool({
    name: "get_component",
    arguments: { name: "nope" },
  });
  assert(
    badResult.isError === true,
    "tool-level errors surface as isError:true",
  );
  assert(
    textOf(badResult).includes("Valid names"),
    "error message guides the agent to valid names",
  );

  console.log(`\n══════════════════════════════`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  process.exitCode = failed > 0 ? 1 : 0;
} finally {
  await client.close().catch(() => {});
}
