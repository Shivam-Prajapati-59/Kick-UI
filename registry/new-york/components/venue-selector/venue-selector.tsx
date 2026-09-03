"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

const expansionEase = [0.16, 1, 0.3, 1] as const;

const OPEN_KEYS = new Set(["ArrowDown", "ArrowUp", "Enter", " "]);

type VenueSelectorContextValue = {
  values: string[];
  open: boolean;
  contentId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  toggleValue: (value: string) => void;
  setOpen: (open: boolean) => void;
};

const VenueSelectorContext =
  React.createContext<VenueSelectorContextValue | null>(null);

function useVenueSelector() {
  const context = React.useContext(VenueSelectorContext);

  if (!context) {
    throw new Error(
      "VenueSelector components must be used within <VenueSelector>.",
    );
  }

  return context;
}

export interface VenueSelectorProps {
  children: React.ReactNode;
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
}

function VenueSelector({
  children,
  values: valuesProp,
  defaultValues = [],
  onValuesChange,
}: VenueSelectorProps) {
  const [uncontrolledValues, setUncontrolledValues] =
    React.useState(defaultValues);
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentId = React.useId();
  const values = valuesProp ?? uncontrolledValues;

  const toggleValue = React.useCallback(
    (value: string) => {
      const nextValues = values.includes(value)
        ? values.filter((selectedValue) => selectedValue !== value)
        : [...values, value];

      if (valuesProp === undefined) setUncontrolledValues(nextValues);
      onValuesChange?.(nextValues);
    },
    [onValuesChange, values, valuesProp],
  );

  React.useEffect(() => {
    if (!open) return;

    const focusFrame = window.requestAnimationFrame(() => {
      const selectedOption = rootRef.current?.querySelector<HTMLButtonElement>(
        '[role="option"][aria-selected="true"]',
      );
      const firstOption = rootRef.current?.querySelector<HTMLButtonElement>(
        '[role="option"]:not(:disabled)',
      );
      (selectedOption ?? firstOption)?.focus();
    });

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const context = React.useMemo(
    () => ({ values, open, contentId, triggerRef, toggleValue, setOpen }),
    [contentId, open, toggleValue, values],
  );

  return (
    <VenueSelectorContext.Provider value={context}>
      <div
        ref={rootRef}
        className="border-input bg-card w-full overflow-hidden rounded-lg border"
      >
        {children}
      </div>
    </VenueSelectorContext.Provider>
  );
}

function VenueSelectorTrigger({
  className,
  children,
  onClick,
  onKeyDown,
  ...props
}: React.ComponentProps<"button">) {
  const { open, setOpen, contentId, triggerRef } = useVenueSelector();

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={contentId}
      data-state={open ? "open" : "closed"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;

        if (OPEN_KEYS.has(event.key)) {
          event.preventDefault();
          setOpen(true);
        }
        if (event.key === "Escape") setOpen(false);
      }}
      className={cn(
        "hover:bg-secondary/50 focus-visible:ring-ring flex h-10 w-full items-center justify-between px-3 text-sm transition-colors outline-none focus-visible:ring-2",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "text-muted-foreground size-4 shrink-0 transition-transform duration-200",
          open && "rotate-180",
        )}
      />
    </button>
  );
}

function VenueSelectorValue({
  placeholder = "Select options",
  singularLabel = "option",
  pluralLabel = "options",
  className,
}: {
  placeholder?: string;
  singularLabel?: string;
  pluralLabel?: string;
  className?: string;
}) {
  const { values } = useVenueSelector();
  const label = values.length
    ? `${values.length} ${values.length === 1 ? singularLabel : pluralLabel}`
    : placeholder;

  return (
    <span
      className={cn(
        "truncate",
        !values.length && "text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}

function VenueSelectorContent({
  className,
  children,
  onKeyDown,
  ...props
}: React.ComponentProps<"div">) {
  const { open, setOpen, contentId, triggerRef } = useVenueSelector();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    const options = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="option"]:not(:disabled)',
      ),
    );
    const activeIndex = options.indexOf(
      document.activeElement as HTMLButtonElement,
    );

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex =
        activeIndex === -1
          ? 0
          : (activeIndex + direction + options.length) % options.length;
      options[nextIndex]?.focus();
    }

    if (event.key === "Home") {
      event.preventDefault();
      options[0]?.focus();
    }

    if (event.key === "End") {
      event.preventDefault();
      options.at(-1)?.focus();
    }
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.3, ease: expansionEase },
            opacity: { duration: 0.18, ease: "easeOut" },
          }}
          className="overflow-hidden will-change-[height,opacity]"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut", delay: 0.1 }}
            className="border-border border-t"
          />
          <div
            id={contentId}
            role="listbox"
            aria-multiselectable="true"
            onKeyDown={handleKeyDown}
            className={cn("p-1.5", className)}
            {...props}
          >
            {React.Children.toArray(children).map((child, index) => (
              <motion.div
                key={React.isValidElement(child) ? child.key : index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.18,
                  ease: "easeOut",
                  delay: index * 0.03,
                }}
              >
                {child}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export interface VenueSelectorItemProps extends Omit<
  React.ComponentProps<"button">,
  "value"
> {
  value: string;
}

function VenueSelectorItem({
  value,
  className,
  children,
  onClick,
  ...props
}: VenueSelectorItemProps) {
  const { values, toggleValue } = useVenueSelector();
  const isSelected = values.includes(value);

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      data-state={isSelected ? "checked" : "unchecked"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggleValue(value);
      }}
      className={cn(
        "focus-visible:ring-ring hover:bg-secondary/50 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-2",
        className,
      )}
      {...props}
    >
      {children}
      {isSelected && <Check className="text-primary ml-auto size-4" />}
    </button>
  );
}

export {
  VenueSelector,
  VenueSelectorContent,
  VenueSelectorItem,
  VenueSelectorTrigger,
  VenueSelectorValue,
};
