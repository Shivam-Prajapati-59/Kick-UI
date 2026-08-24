import { handleMcpPost } from "@/lib/mcp/server";

/**
 * MCP endpoint (Streamable HTTP, stateless mode).
 *
 * Connect any MCP client:
 *   Claude Desktop / Cursor / custom agents →
 *     URL: https://kick-ui.vercel.app/api/mcp  (transport: HTTP)
 *
 * The registry catalog is baked in at build time (src/generated/mcp-data.ts),
 * so this route performs zero filesystem access at runtime.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// Streamable HTTP clients probe with GET; stateless servers without an SSE
// stream answer 405 per the MCP spec.
export async function GET() {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { ...CORS_HEADERS, Allow: "POST, OPTIONS" },
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const { status, body } = handleMcpPost(rawBody);

  if (status === 202 || body === undefined) {
    return new Response(null, { status: 202, headers: CORS_HEADERS });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
