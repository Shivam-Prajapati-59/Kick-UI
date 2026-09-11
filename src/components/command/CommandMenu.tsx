"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { componentIndex } from "@/generated/component-index";
import { guideHref, guideSections } from "@/config/docs";

/* ------------------------------------------------------------------ */
/*  Entries (pure data)                                                 */
/* ------------------------------------------------------------------ */

export interface CommandEntry {
  id: string;
  label: string;
  hint: string;
  href?: string;
  action?: "toggle-theme";
}

export function buildCommandEntries(): CommandEntry[] {
  const guides = guideSections.flatMap((section) => section.pages);
  return [
    { id: "home", label: "Home", hint: "Page", href: "/" },
    {
      id: "components",
      label: "All components",
      hint: "Page",
      href: "/components",
    },
    ...guides.map((page) => ({
      id: `guide:${page.slug}`,
      label: page.title,
      hint: "Guide",
      href: guideHref(page.slug),
    })),
    ...componentIndex.map((component) => ({
      id: `component:${component.slug}`,
      label: component.title,
      hint: "Component",
      href: `/components/${component.slug}`,
    })),
    {
      id: "action:toggle-theme",
      label: "Toggle theme",
      hint: "Action",
      action: "toggle-theme" as const,
    },
  ];
}

export function filterCommandEntries(
  entries: CommandEntry[],
  query: string,
): CommandEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return entries;
  return entries.filter(
    (entry) =>
      entry.label.toLowerCase().includes(needle) ||
      entry.hint.toLowerCase().includes(needle) ||
      entry.id.toLowerCase().includes(needle),
  );
}

/* ------------------------------------------------------------------ */
/*  Open state                                                          */
/* ------------------------------------------------------------------ */

interface CommandMenuContextValue {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const CommandMenuContext = createContext<CommandMenuContextValue | null>(null);

export function CommandMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return (
    <CommandMenuContext.Provider value={value}>
      {children}
    </CommandMenuContext.Provider>
  );
}

export function useCommandMenu(): CommandMenuContextValue {
  const context = useContext(CommandMenuContext);
  if (!context) {
    throw new Error(
      "useCommandMenu must be used within <CommandMenuProvider>.",
    );
  }
  return context;
}

/* ------------------------------------------------------------------ */
/*  Menu                                                                */
/* ------------------------------------------------------------------ */

export function CommandMenu() {
  const { open, setOpen } = useCommandMenu();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const entries = useMemo(() => buildCommandEntries(), []);
  const matches = useMemo(
    () => filterCommandEntries(entries, query),
    [entries, query],
  );
  const active =
    matches[Math.min(activeIndex, Math.max(matches.length - 1, 0))];

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, [setOpen]);

  const runEntry = useCallback(
    (entry: CommandEntry) => {
      if (entry.action === "toggle-theme") {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      } else if (entry.href) {
        router.push(entry.href);
      }
      close();
    },
    [close, resolvedTheme, router, setTheme],
  );

  // Global entry point: Cmd/Ctrl+K. Ignored while typing so the
  // shortcut never hijacks text entry.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) close();
        else setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open, setOpen]);

  useEffect(() => {
    // Focus needs the mounted input; query state is already reset by close().
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
  };

  if (!open) return null;

  const showEmpty = matches.length === 0;

  return (
    <div
      className="bg-background/80 fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[15vh] backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="border-border bg-card w-full max-w-lg overflow-hidden rounded-xl border shadow-2xl"
      >
        <div className="border-border/50 flex items-center gap-2 border-b px-4">
          <Search className="text-muted-foreground h-4 w-4 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((index) =>
                  matches.length === 0 ? 0 : (index + 1) % matches.length,
                );
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((index) =>
                  matches.length === 0
                    ? 0
                    : (index - 1 + matches.length) % matches.length,
                );
              } else if (event.key === "Enter") {
                event.preventDefault();
                if (active) runEntry(active);
              } else if (event.key === "Escape") {
                event.preventDefault();
                close();
              }
            }}
            placeholder="Search components, guides, actions…"
            aria-label="Search components, guides, and actions"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-menu-list"
            aria-activedescendant={
              active ? `command-menu-option-${active.id}` : undefined
            }
            className="placeholder:text-muted-foreground focus-visible:ring-ring h-12 w-full rounded-md bg-transparent text-sm outline-none focus-visible:ring-2"
          />
          <kbd className="border-border bg-muted text-muted-foreground hidden shrink-0 items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] sm:flex">
            esc
          </kbd>
        </div>
        <div
          ref={listRef}
          id="command-menu-list"
          role="listbox"
          aria-label="Results"
          className="max-h-[40vh] overflow-y-auto p-2"
        >
          {showEmpty && (
            <p className="text-muted-foreground px-3 py-6 text-center text-sm">
              No results for “{query}”.
            </p>
          )}
          {!showEmpty &&
            matches.map((entry, index) => {
              const selected = entry.id === active?.id && index === activeIndex;
              return (
                <button
                  key={entry.id}
                  id={`command-menu-option-${entry.id}`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => runEntry(entry)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    selected
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="truncate">{entry.label}</span>
                  <span className="text-muted-foreground/70 shrink-0 text-xs">
                    {entry.hint}
                  </span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
