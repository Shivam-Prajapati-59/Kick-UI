import type { SnapSwapQuote, SnapSwapQuoteRequest } from "./snap-swap";

export const SOLANA_TOKENS: Record<string, { mint: string; decimals: number }> =
  {
    SOL: { mint: "So11111111111111111111111111111111111111112", decimals: 9 },
    USDC: { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
    USDT: { mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6 },
    JUP: { mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", decimals: 6 },
    BONK: { mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5 },
  };

const MINT_TO_SYMBOL: Record<string, string> = Object.fromEntries(
  Object.entries(SOLANA_TOKENS).map(([sym, v]) => [v.mint, sym]),
);

function namedError(name: string, message: string) {
  const error = new Error(message);
  error.name = name;
  return error;
}

/** Exact decimal string -> integer base units, no floating point. */
function toBaseUnits(text: string, decimals: number) {
  if (!/^\d*\.?\d*$/.test(text) || !/\d/.test(text)) {
    throw new Error("Invalid amount");
  }
  const [whole = "", fraction = ""] = text.split(".");
  if (fraction.length > decimals) {
    throw namedError(
      "PrecisionError",
      `At most ${decimals} decimal places are supported`,
    );
  }
  return BigInt((whole || "0") + fraction.padEnd(decimals, "0"));
}

export async function fetchJupiterQuote(
  req: SnapSwapQuoteRequest,
): Promise<SnapSwapQuote> {
  const payToken = SOLANA_TOKENS[req.pay.symbol];
  const receiveToken = SOLANA_TOKENS[req.receive.symbol];
  if (!payToken || !receiveToken) throw new Error("Unknown token");
  const baseUnits = toBaseUnits(req.amountText, payToken.decimals);
  if (baseUnits < BigInt(1)) throw new Error("Amount too small");
  const slippageBps = Math.round(req.slippage * 100);
  const url = `https://api.jup.ag/swap/v1/quote?inputMint=${payToken.mint}&outputMint=${receiveToken.mint}&amount=${baseUnits}&slippageBps=${slippageBps}`;
  const res = await fetch(url, { signal: req.signal });
  const body = (await res.json()) as {
    error?: string;
    errorCode?: string;
    outAmount?: string;
    otherAmountThreshold?: string;
    priceImpactPct?: string;
    routePlan?: Array<{
      swapInfo?: { label?: string; inputMint?: string; outputMint?: string };
      percent?: number;
    }>;
  };
  if (!res.ok || body?.error) {
    const message = body?.error ?? `Quote failed: ${res.status}`;
    if (
      body?.errorCode === "COULD_NOT_FIND_ANY_ROUTE" ||
      body?.errorCode === "NO_ROUTES_FOUND" ||
      /no route|could not find any route/i.test(message)
    ) {
      throw namedError("NoRouteError", message);
    }
    throw new Error(message);
  }
  const outDecimals = receiveToken.decimals;
  const amountOut = Number(body.outAmount) / 10 ** outDecimals;
  const minReceived = Number(body.otherAmountThreshold) / 10 ** outDecimals;
  const priceImpact = Number(body.priceImpactPct) * 100;
  if (
    !Number.isFinite(amountOut) ||
    !Number.isFinite(minReceived) ||
    !Number.isFinite(priceImpact) ||
    amountOut <= 0
  ) {
    throw new Error("Malformed quote");
  }
  const hops = (body.routePlan ?? []).map((leg) => {
    const info = leg.swapInfo ?? {};
    const fromMint = info.inputMint ?? "";
    const toMint = info.outputMint ?? "";
    const from = MINT_TO_SYMBOL[fromMint] ?? `${fromMint.slice(0, 4)}…`;
    const to = MINT_TO_SYMBOL[toMint] ?? `${toMint.slice(0, 4)}…`;
    return {
      from,
      to,
      venue: info.label ?? "Unknown",
      share: typeof leg.percent === "number" ? leg.percent : 100,
    };
  });
  return { amountOut, minReceived, priceImpact, hops };
}

export async function fetchJupiterPrices(
  symbols: string[],
  signal: AbortSignal,
): Promise<Record<string, number>> {
  const mints = symbols
    .map((s) => SOLANA_TOKENS[s]?.mint)
    .filter((m): m is string => Boolean(m));
  if (mints.length === 0) return {};
  const url = `https://api.jup.ag/price/v3?ids=${mints.join(",")}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Price failed: ${res.status}`);
  const body = (await res.json()) as Record<
    string,
    { usdPrice?: number; decimals?: number } | undefined
  >;
  const result: Record<string, number> = {};
  for (const sym of symbols) {
    const mint = SOLANA_TOKENS[sym]?.mint;
    if (mint && body?.[mint]?.usdPrice != null) {
      result[sym] = body[mint]!.usdPrice as number;
    }
  }
  return result;
}
