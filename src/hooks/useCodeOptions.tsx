"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Language = "JS" | "TS";
export type StylePreset = "CSS" | "TW";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type InstallMode = "cli" | "manual";

export interface CodeOptionsContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  style: StylePreset;
  setStyle: (s: StylePreset) => void;
  packageManager: PackageManager;
  setPackageManager: (p: PackageManager) => void;
  installMode: InstallMode;
  setInstallMode: (m: InstallMode) => void;
}

/* ------------------------------------------------------------------ */
/*  Persisted state hook (SSR-safe)                                    */
/* ------------------------------------------------------------------ */

const STORAGE_PREFIX = "kick-ui-";

function usePersistedState<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const storageKey = `${STORAGE_PREFIX}${key}`;

  const getSnapshot = () => {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const subscribe = (onStoreChange: () => void) => {
    const customEvent = `kick-ui-storage:${storageKey}`;
    const handler = (event: StorageEvent) => {
      if (event.key === storageKey) onStoreChange();
    };
    const customHandler = () => onStoreChange();

    window.addEventListener("storage", handler);
    window.addEventListener(customEvent, customHandler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(customEvent, customHandler);
    };
  };

  const value = useSyncExternalStore(subscribe, getSnapshot, () => defaultValue);

  const setValue = (nextValue: T) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextValue));
      window.dispatchEvent(new Event(`kick-ui-storage:${storageKey}`));
    } catch {
      // localStorage unavailable — silent fail
    }
  };

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
  defaultInstallMode?: InstallMode;
}

export function CodeOptionsProvider({
  children,
  defaultLanguage = "TS",
  defaultStyle = "TW",
  defaultPackageManager = "npm",
  defaultInstallMode = "cli",
}: CodeOptionsProviderProps) {
  const [language, setLanguage] = usePersistedState<Language>("lang", defaultLanguage);
  const [style, setStyle] = usePersistedState<StylePreset>("style", defaultStyle);
  const [packageManager, setPackageManager] = usePersistedState<PackageManager>("pkg", defaultPackageManager);
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
