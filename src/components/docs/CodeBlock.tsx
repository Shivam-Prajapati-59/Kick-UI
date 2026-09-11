"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useTheme } from "next-themes";

import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDarkLike, coldarkLightLike } from "@/lib/code-theme";
import { TokenizedLines, type CodeToken } from "@/lib/code-tokens";
import { unlockSound, useCopyChime } from "@/lib/sound";
import { toast } from "@/components/feedback/Toaster";
import { cn } from "@/lib/utils";

const COPY_RESET_MS = 2000;

interface CodeBlockProps {
  children: string | string[];
  language?: string;
  showLineNumbers?: boolean;
  /**
   * Ordered highlight rules for terminal-style content (commands, prompt
   * transcripts). When provided, rules render instead of Prism grammar so
   * tokens like command names, paths and `?` get deliberate colors.
   * See `terminalTokens` for the shared guide palette.
   */
  tokens?: CodeToken[];
}

const CodeBlock = ({
  children,
  language,
  showLineNumbers = false,
  tokens,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copyChime = useCopyChime();
  const { resolvedTheme } = useTheme();
  const syntaxTheme =
    resolvedTheme === "light" ? coldarkLightLike : coldarkDarkLike;

  const handleCopy = useCallback(async () => {
    const text = String(children).trim();
    void unlockSound();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    copyChime.chime();
    toast("Copied to clipboard");
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      setCopied(false);
      copyChime.reset();
    }, COPY_RESET_MS);
  }, [children, copyChime]);

  return (
    <div className="group border-border bg-card relative overflow-hidden rounded-lg border">
      <button
        onClick={handleCopy}
        title={copied ? "Copied!" : "Copy to clipboard"}
        aria-label={
          copied ? "Code copied to clipboard" : "Copy code to clipboard"
        }
        className={cn(
          "absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-md",
          "border-border text-muted-foreground border",
          "opacity-60 transition-all duration-200 hover:opacity-100",
          copied
            ? "bg-emerald-600/20 text-emerald-400 opacity-100"
            : "bg-background hover:bg-muted hover:text-foreground",
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
      {tokens ? (
        <pre className="code-highlighter text-foreground m-0 overflow-auto p-4 font-mono text-[0.875rem] leading-6 whitespace-pre-wrap">
          <code>
            <TokenizedLines text={String(children)} tokens={tokens} />
          </code>
        </pre>
      ) : (
        <SyntaxHighlighter
          language={language}
          style={syntaxTheme}
          showLineNumbers={showLineNumbers}
          className="code-highlighter"
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: "0.875rem",
            lineHeight: "1.5rem",
          }}
        >
          {children}
        </SyntaxHighlighter>
      )}
    </div>
  );
};

export default CodeBlock;
