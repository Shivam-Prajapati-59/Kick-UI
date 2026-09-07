"use client";

import { CheckCheck, CopyCheckIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useTheme } from "next-themes";

import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { coldarkLightLike } from "@/lib/code-theme";
import { unlockSound, useCopyChime } from "@/lib/sound";

const COPY_RESET_MS = 2000;

interface CodeBlockProps {
  children: string | string[];
  language?: string;
  showLineNumbers?: boolean;
}

const CodeBlock = ({
  children,
  language,
  showLineNumbers = false,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copyChime = useCopyChime();
  const { resolvedTheme } = useTheme();
  const syntaxTheme =
    resolvedTheme === "light" ? coldarkLightLike : coldarkDark;

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
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      setCopied(false);
      copyChime.reset();
    }, COPY_RESET_MS);
  }, [children, copyChime]);

  return (
    <div className="docs-code">
      <div className="docs-code-header">
        <button
          className="docs-copy-button"
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy to clipboard"}
          aria-label={
            copied ? "Code copied to clipboard" : "Copy code to clipboard"
          }
        >
          {copied ? <CheckCheck /> : <CopyCheckIcon />}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={syntaxTheme}
        showLineNumbers={showLineNumbers}
        className="code-highlighter"
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
