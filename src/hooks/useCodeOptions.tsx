"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Language = "JS" | "TS";
export type StylePreset = "CSS" | "TW";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type CliTool = "shadcn" | "jsrepo";
export type InstallMode = "cli" | "manual";

export interface CodeOptionsContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  style: StylePreset;
  setStyle: (s: StylePreset) => void;
  packageManager: PackageManager;
  setPackageManager: (p: PackageManager) => void;
  cliTool: CliTool;
  setCliTool: (t: CliTool) => void;
  installMode: InstallMode;
  setInstallMode: (m: InstallMode) => void;
}

/* ------------------------------------------------------------------ */
/*  Persisted state hook (SSR-safe)                                    */
/* ------------------------------------------------------------------ */

const STORAGE_PREFIX = "kick-ui-";

function usePersistedState<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const storageKey = `${STORAGE_PREFIX}${key}`;
  const [value, setValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  // Read from localStorage AFTER hydration to avoid SSR mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      // localStorage unavailable or parse error — use default
    }
    setHydrated(true);
  }, [storageKey]);

  // Write to localStorage on changes (skip initial hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // localStorage unavailable — silent fail
    }
  }, [storageKey, value, hydrated]);

  return [value, setValue];
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const CodeOptionsContext = createContext<CodeOptionsContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

interface CodeOptionsProviderProps {
  children: ReactNode;
  /** Override defaults for specific pages if needed */
  defaultLanguage?: Language;
  defaultStyle?: StylePreset;
  defaultPackageManager?: PackageManager;
  defaultCliTool?: CliTool;
  defaultInstallMode?: InstallMode;
}

export function CodeOptionsProvider({
  children,
  defaultLanguage = "TS",
  defaultStyle = "TW",
  defaultPackageManager = "npm",
  defaultCliTool = "shadcn",
  defaultInstallMode = "cli",
}: CodeOptionsProviderProps) {
  const [language, setLanguage] = usePersistedState<Language>("lang", defaultLanguage);
  const [style, setStyle] = usePersistedState<StylePreset>("style", defaultStyle);
  const [packageManager, setPackageManager] = usePersistedState<PackageManager>("pkg", defaultPackageManager);
  const [cliTool, setCliTool] = usePersistedState<CliTool>("cli", defaultCliTool);
  const [installMode, setInstallMode] = usePersistedState<InstallMode>("mode", defaultInstallMode);

  return (
    <CodeOptionsContext.Provider
      value={{
        language,
        setLanguage,
        style,
        setStyle,
        packageManager,
        setPackageManager,
        cliTool,
        setCliTool,
        installMode,
        setInstallMode,
      }}
    >
      {children}
    </CodeOptionsContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useCodeOptions(): CodeOptionsContextValue {
  const ctx = useContext(CodeOptionsContext);
  if (!ctx) {
    throw new Error(
      "useCodeOptions must be used within a <CodeOptionsProvider>. " +
      "Wrap your component tree (e.g. in the layout or page) with <CodeOptionsProvider>."
    );
  }
  return ctx;
}
