"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Check, Copy, Terminal } from "lucide-react";

interface InstallCommandProps {
  command: string;
  className?: string;
}

export function InstallCommand({ command, className }: InstallCommandProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative group flex items-center gap-3 rounded-lg border border-border bg-zinc-950 dark:bg-zinc-900 px-4 py-3 my-4",
        className
      )}
    >
      <Terminal className="h-4 w-4 shrink-0 text-zinc-500" />
      <code className="flex-1 overflow-x-auto text-sm text-zinc-100 font-mono">
        {command}
      </code>
      <button
        onClick={handleCopy}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          "border border-zinc-700 bg-zinc-800 text-zinc-400",
          "opacity-0 transition-all duration-200 group-hover:opacity-100",
          "hover:bg-zinc-700 hover:text-zinc-200"
        )}
        aria-label="Copy command"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

interface StepsProps {
  children: React.ReactNode;
  className?: string;
}

export function Steps({ children, className }: StepsProps) {
  return (
    <div className={cn("relative my-6 ml-3 border-l-2 border-border pl-8 [counter-reset:step]", className)}>
      {children}
    </div>
  );
}

interface StepProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Step({ title, children, className }: StepProps) {
  return (
    <div className={cn("relative pb-8 last:pb-0 [counter-increment:step]", className)}>
      <div className="absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background text-sm font-bold text-foreground before:content-[counter(step)]" />
      <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}
