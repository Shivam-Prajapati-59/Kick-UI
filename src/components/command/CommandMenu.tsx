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
import * as Dialog from "@radix-ui/react-dialog";
import {
  BookOpenText,
  Boxes,
  House,
  LayoutGrid,
  Search,
  SunMoon,
  X,
} from "lucide-react";
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
  description?: string;
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
      description: page.description,
      href: guideHref(page.slug),
    })),
    ...componentIndex.map((component) => ({
      id: `component:${component.slug}`,
      label: component.title,
      hint: "Component",
      description: component.description,
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
      entry.description?.toLowerCase().includes(needle) ||
      entry.hint.toLowerCase().includes(needle) ||
      entry.id.toLowerCase().includes(needle),
  );
}

const commandSections = [
  { hint: "Page", title: "Pages" },
  { hint: "Guide", title: "Installation" },
  { hint: "Component", title: "Components" },
  { hint: "Action", title: "Actions" },
] as const;

function getCommandIcon(entry: CommandEntry) {
  if (entry.id === "home") return House;
  if (entry.id === "components") return LayoutGrid;
  if (entry.hint === "Guide") return BookOpenText;
  if (entry.hint === "Action") return SunMoon;
  return Boxes;
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
  const previousFocusRef = useRef<HTMLElement | null>(null);

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

  // Ignore text entry when closed, but allow the shortcut to close the menu
  // while its search input is focused.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "k"
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        !open &&
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      if (open) close();
      else setOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open, setOpen]);

  useEffect(() => {
    if (!open || matches.length === 0) return;
    const option = listRef.current?.querySelector<HTMLElement>(
      `[data-command-index="${activeIndex}"]`,
    );
    option?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, matches, open]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
  };

  const showEmpty = matches.length === 0;
  const indexedMatches = matches.map((entry, index) => ({ entry, index }));

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setOpen(true);
        else close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="bg-background/80 fixed inset-0 z-[100] backdrop-blur-sm" />
        <Dialog.Content
          onOpenAutoFocus={(event) => {
            previousFocusRef.current =
              document.activeElement as HTMLElement | null;
            event.preventDefault();
            inputRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const previousFocus = previousFocusRef.current;
            const fallback = document.querySelector<HTMLElement>(
              "[data-search-trigger]",
            );
            if (previousFocus?.isConnected && previousFocus !== document.body) {
              previousFocus.focus();
            } else {
              fallback?.focus();
            }
            previousFocusRef.current = null;
          }}
          className="border-border bg-card fixed top-[15vh] left-1/2 z-[101] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border shadow-2xl"
        >
          <Dialog.Title className="sr-only">Search Kick UI</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search components and guides, or run a site action.
          </Dialog.Description>
          <div className="border-border/50 focus-within:ring-ring/70 flex items-center gap-2 rounded-t-xl border-b px-4 focus-within:ring-2 focus-within:ring-inset">
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
              className="placeholder:text-muted-foreground h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={close}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-ring flex size-7 shrink-0 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
            >
              <X className="size-4" />
            </button>
          </div>
          <div
            ref={listRef}
            id="command-menu-list"
            role="listbox"
            aria-label="Results"
            className="scrollbar-slim max-h-[40vh] [scrollbar-gutter:stable] overflow-y-auto p-2"
          >
            {showEmpty && (
              <p className="text-muted-foreground px-3 py-6 text-center text-sm">
                No results for “{query}”.
              </p>
            )}
            {!showEmpty &&
              commandSections.map(({ hint, title }) => {
                const items = indexedMatches.filter(
                  ({ entry }) => entry.hint === hint,
                );
                if (items.length === 0) return null;

                return (
                  <div key={hint} role="group" aria-label={title}>
                    <p className="text-muted-foreground px-3 pt-3 pb-1.5 text-xs font-medium">
                      {title}
                    </p>
                    {items.map(({ entry, index }) => {
                      const selected = index === activeIndex;
                      const EntryIcon = getCommandIcon(entry);

                      return (
                        <button
                          key={entry.id}
                          type="button"
                          id={`command-menu-option-${entry.id}`}
                          data-command-index={index}
                          role="option"
                          aria-selected={selected}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => runEntry(entry)}
                          className={cn(
                            "text-foreground flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition-colors",
                            selected ? "bg-secondary" : "hover:bg-secondary/60",
                          )}
                        >
                          <EntryIcon
                            aria-hidden="true"
                            className="text-primary size-4 shrink-0"
                          />
                          <span className="truncate">{entry.label}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
