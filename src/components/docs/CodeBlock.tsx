"use client";

import { CheckCheck, CopyCheckIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTheme } from 'next-themes';

import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { coldarkLightLike } from '@/lib/code-theme';

const COPY_RESET_MS = 2000;

interface CodeBlockProps {
    children: string | string[];
    language?: string;
    showLineNumbers?: boolean;
}

const CodeBlock = ({ children, language, showLineNumbers = false }: CodeBlockProps) => {
    const [copied, setCopied] = useState(false);
    const { resolvedTheme } = useTheme();
    const syntaxTheme = resolvedTheme === 'light' ? coldarkLightLike : coldarkDark;

    const handleCopy = useCallback(async () => {
        const text = String(children).trim();
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            return;
        }
        setCopied(true);
        setTimeout(() => setCopied(false), COPY_RESET_MS);
    }, [children]);

    return (
        <div className="docs-code">
            <div className="docs-code-header">
                <button
                    className="docs-copy-button"
                    onClick={handleCopy}
                    title={copied ? 'Copied!' : 'Copy to clipboard'}
                    aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
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