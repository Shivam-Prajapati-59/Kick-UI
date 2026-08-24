import { mcpComponents } from "@/generated/mcp-data";

/**
 * Model Context Protocol server for the Kick UI registry.
 *
 * Implements the MCP tool surface over JSON-RPC 2.0 (Streamable HTTP,
 * stateless mode). Framework-agnostic: the route handler only wires
 * Request/Response — all protocol + tool logic lives here so it stays
 * unit-testable and portable.
 */

export const MCP_SERVER_INFO = {
  name: "kick-ui",
  title: "Kick UI Registry",
  version: "1.0.0",
} as const;

const SUPPORTED_PROTOCOL_VERSION = "2025-06-18";

/** Echo the client's version when supported, else fall back to ours. */
function negotiateProtocolVersion(clientVersion: unknown): string {
  if (
    typeof clientVersion === "string" &&
    clientVersion === SUPPORTED_PROTOCOL_VERSION
  ) {
    return clientVersion;
  }
  return SUPPORTED_PROTOCOL_VERSION;
}

// ─── Tool definitions ────────────────────────────────────────────────────────

type JsonSchema = {
  type: "object";
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
};

interface ToolDefinition {
  name: string;
  title: string;
  description: string;
  inputSchema: JsonSchema;
}

const CATEGORIES = [...new Set(mcpComponents.map((c) => c.category))];
const COMPONENT_NAMES = mcpComponents.map((c) => c.name);

const TOOLS: ToolDefinition[] = [
  {
    name: "list_components",
    title: "List Kick UI components",
    description:
      "List every component in the Kick UI registry with its category and a one-line description. Use this to discover what is available before inspecting details.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: CATEGORIES,
          description: "Optional filter. One of: " + CATEGORIES.join(", "),
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "search_components",
    title: "Search Kick UI components",
    description:
      'Full-text search across component names, titles, descriptions, and categories. Example queries: "button", "carousel", "text effect", "dock".',
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search keywords.",
          minLength: 1,
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "get_component",
    title: "Get Kick UI component details",
    description:
      "Get everything needed to use one component: description, install command, dependencies, props table, usage example, and full TypeScript source code.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          enum: COMPONENT_NAMES,
          description: "Component slug. One of: " + COMPONENT_NAMES.join(", "),
        },
      },
      required: ["name"],
      additionalProperties: false,
    },
  },
  {
    name: "get_install_guide",
    title: "Get Kick UI install guide",
    description:
      "How to add the Kick UI namespace to a project's components.json and install any component by short name. Call this once before recommending install commands.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

// ─── Tool implementations ────────────────────────────────────────────────────

class ToolError extends Error {}

function formatCatalogEntry(c: (typeof mcpComponents)[number]): string {
  return `- ${c.name} (${c.category}) — ${c.description}`;
}

function formatPropsTable(c: (typeof mcpComponents)[number]): string {
  if (c.props.length === 0) return "This component takes no documented props.";
  const rows = c.props.map(
    (p) =>
      `| ${p.name} | \`${p.type}\` | ${p.default ?? "—"} | ${p.description ?? ""} |`,
  );
  return [
    "| Prop | Type | Default | Description |",
    "| --- | --- | --- | --- |",
    ...rows,
  ].join("\n");
}

function handleToolCall(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case "list_components": {
      const category =
        typeof args.category === "string" ? args.category : undefined;
      if (category !== undefined && !CATEGORIES.includes(category)) {
        throw new ToolError(
          `Unknown category "${category}". Valid categories: ${CATEGORIES.join(", ")}`,
        );
      }
      const items = mcpComponents.filter(
        (c) => category === undefined || c.category === category,
      );
      if (items.length === 0)
        throw new ToolError(`No components in category "${category}".`);
      return [
        `Kick UI registry — ${items.length} component(s):`,
        ...items.map(formatCatalogEntry),
      ].join("\n");
    }

    case "search_components": {
      const query = String(args.query ?? "")
        .trim()
        .toLowerCase();
      if (!query) throw new ToolError("`query` must be a non-empty string.");
      const scored = mcpComponents
        .map((c) => {
          let score = 0;
          if (c.name.toLowerCase().includes(query)) score += 4;
          if (c.title.toLowerCase().includes(query)) score += 3;
          if (c.category.toLowerCase().includes(query)) score += 2;
          if (c.description.toLowerCase().includes(query)) score += 1;
          return { c, score };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      if (scored.length === 0) {
        return `No Kick UI components match "${query}". Try list_components for the full catalog.`;
      }
      return [
        `${scored.length} result(s) for "${query}" (best first):`,
        ...scored.map(({ c }) => formatCatalogEntry(c)),
      ].join("\n");
    }

    case "get_component": {
      const componentName = String(args.name ?? "");
      const c = mcpComponents.find((comp) => comp.name === componentName);
      if (!c) {
        throw new ToolError(
          `Unknown component "${componentName}". Valid names: ${COMPONENT_NAMES.join(", ")}`,
        );
      }
      const sections = [
        `# ${c.title}`,
        "",
        c.description,
        "",
        "**Category**: " + c.category,
        "",
        "**Install**:",
        "```bash",
        `npx shadcn@latest add ${c.installCommand}`,
        "```",
        "",
        c.registryDependencies.length > 0
          ? `**Registry dependencies** (shadcn primitives installed automatically): ${c.registryDependencies.join(", ")}`
          : null,
        c.dependencies.length > 0
          ? `**npm dependencies** (installed automatically by the CLI): ${c.dependencies.join(", ")}`
          : null,
        "",
        "**Props**:",
        "",
        formatPropsTable(c),
        "",
        "**Usage**:",
        "```tsx",
        c.usage || "// See source below.",
        "```",
        "",
        "**Source** (`components/ui/${c.name}.tsx` after install):",
        "```tsx",
        c.sourceCode,
        "```",
      ];
      return sections.filter((s) => s !== null).join("\n");
    }

    case "get_install_guide":
      return [
        "# Installing Kick UI components",
        "",
        "## Option A — one-off install (no configuration)",
        "```bash",
        `npx shadcn@latest add https://kick-ui.vercel.app/r/<component>.json`,
        "```",
        "",
        "## Option B — namespace install (recommended)",
        "Add the Kick UI registry to your project's `components.json`:",
        "```json",
        "{",
        '  "registries": {',
        '    "@kick-ui": "https://kick-ui.vercel.app/r/{name}.json"',
        "  }",
        "}",
        "```",
        "Then install any component:",
        "```bash",
        "npx shadcn@latest add @kick-ui/<component>",
        "```",
        "",
        "The CLI installs npm dependencies and shadcn primitives automatically. Components ship as TypeScript source you own.",
      ].join("\n");

    default:
      throw new ToolError(`Unknown tool "${name}".`);
  }
}

// ─── JSON-RPC plumbing ───────────────────────────────────────────────────────

interface RpcRequest {
  jsonrpc?: unknown;
  id?: unknown;
  method?: unknown;
  params?: Record<string, unknown>;
}

export interface McpResponse {
  status: number;
  body?: unknown;
}

function ok(id: unknown, result: unknown): McpResponse {
  return { status: 200, body: { jsonrpc: "2.0", id, result } };
}

function rpcError(id: unknown, code: number, message: string): McpResponse {
  return {
    status: 200,
    body: { jsonrpc: "2.0", id, error: { code, message } },
  };
}

function validateArgs(
  schema: JsonSchema,
  args: Record<string, unknown>,
): string | null {
  for (const key of schema.required ?? []) {
    if (!(key in args)) return `Missing required argument "${key}".`;
  }
  const props = schema.properties ?? {};
  for (const [key, value] of Object.entries(args)) {
    const propSchema = props[key] as
      { type?: string; minLength?: number } | undefined;
    if (!propSchema) return `Unknown argument "${key}".`;
    if (propSchema.type === "string" && typeof value !== "string") {
      return `Argument "${key}" must be a string.`;
    }
    if (
      propSchema.type === "string" &&
      typeof value === "string" &&
      typeof propSchema.minLength === "number" &&
      value.length < propSchema.minLength
    ) {
      return `Argument "${key}" must not be empty.`;
    }
  }
  return null;
}

/**
 * Handle one parsed JSON-RPC message.
 *
 * JSON-RPC semantics: a message WITHOUT an `id` property is a notification
 * and must never receive a response body — even for ping/tools/call or
 * method-level errors. An explicit `id: null` is still treated as a request
 * and receives a normal response.
 */
export function handleRpcMessage(message: RpcRequest): McpResponse {
  const hasId = Object.prototype.hasOwnProperty.call(message, "id");
  const response = dispatchRpcMessage(message);

  // Collapse any dispatched result/error into an empty acknowledgement when
  // the incoming message was a notification.
  if (!hasId) return { status: 202 };
  return response;
}

function dispatchRpcMessage(message: RpcRequest): McpResponse {
  const { method } = message;

  switch (method) {
    case "initialize":
      return ok(message.id, {
        protocolVersion: negotiateProtocolVersion(
          message.params?.protocolVersion,
        ),
        capabilities: {
          tools: { listChanged: false },
        },
        serverInfo: MCP_SERVER_INFO,
        instructions:
          "Kick UI is a shadcn-compatible animated React component registry. " +
          "Use search_components or list_components to find components, get_component for " +
          "full docs + source, then give the user the install command returned by get_component " +
          "(or call get_install_guide once for namespace setup instructions).",
      });

    case "notifications/initialized":
      return { status: 202 };

    case "ping":
      return ok(message.id, {});

    case "tools/list":
      return ok(message.id, { tools: TOOLS });

    case "tools/call": {
      const params = message.params ?? {};
      const name = String(params.name ?? "");
      const tool = TOOLS.find((t) => t.name === name);
      if (!tool) {
        return rpcError(message.id, -32602, `Unknown tool "${name}".`);
      }
      const args =
        params.arguments && typeof params.arguments === "object"
          ? (params.arguments as Record<string, unknown>)
          : {};
      const validationError = validateArgs(tool.inputSchema, args);
      if (validationError) {
        return rpcError(message.id, -32602, validationError);
      }
      try {
        return ok(message.id, {
          content: [{ type: "text", text: handleToolCall(name, args) }],
        });
      } catch (error) {
        const messageText =
          error instanceof ToolError
            ? error.message
            : "Internal error while executing tool.";
        return ok(message.id, {
          content: [{ type: "text", text: messageText }],
          isError: true,
        });
      }
    }

    default:
      if (typeof method === "string" && method.startsWith("notifications/")) {
        return { status: 202 };
      }
      return rpcError(
        message.id,
        -32601,
        `Method not found: ${String(method)}`,
      );
  }
}

/** Parse raw request body and dispatch. Returns parse-error response on bad JSON. */
export function handleMcpPost(rawBody: string): McpResponse {
  let message: RpcRequest;
  try {
    message = JSON.parse(rawBody);
  } catch {
    return rpcError(
      null,
      -32700,
      "Parse error: request body is not valid JSON.",
    );
  }

  if (
    typeof message !== "object" ||
    message === null ||
    message.jsonrpc !== "2.0" ||
    typeof message.method !== "string"
  ) {
    return rpcError(
      (message as RpcRequest | undefined)?.id ?? null,
      -32600,
      'Invalid Request: expected a JSON-RPC 2.0 message with jsonrpc:"2.0" and a string method.',
    );
  }

  // Batch requests are not needed for this stateless tool surface.
  return handleRpcMessage(message);
}
