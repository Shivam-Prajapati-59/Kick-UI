"use client";

import { useEffect, useReducer } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Queue (pure — unit tested)                                          */
/* ------------------------------------------------------------------ */

export interface Toast {
  id: number;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  nextId: number;
}

export type { ToastState };

export type ToastAction =
  { type: "push"; message: string } | { type: "dismiss"; id: number };

export const TOAST_LIMIT = 3;
export const TOAST_DURATION_MS = 2500;

export function toastReducer(
  state: ToastState,
  action: ToastAction,
): ToastState {
  switch (action.type) {
    case "push": {
      const toast = { id: state.nextId, message: action.message };
      return {
        toasts: [...state.toasts, toast].slice(-TOAST_LIMIT),
        nextId: state.nextId + 1,
      };
    }
    case "dismiss":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.id),
      };
  }
}

const initialToastState: ToastState = { toasts: [], nextId: 1 };

/* ------------------------------------------------------------------ */
/*  Module API                                                          */
/* ------------------------------------------------------------------ */

let pushToast: ((message: string) => void) | null = null;

/** Queues a transient confirmation. Safe to call before mount (dropped). */
export function toast(message: string): void {
  pushToast?.(message);
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                            */
/* ------------------------------------------------------------------ */

function ToastItem({
  toast,
  onDone,
}: {
  toast: Toast;
  onDone: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onDone, toast.id]);

  return (
    <div
      role="status"
      className={cn(
        "border-border bg-card text-foreground pointer-events-auto flex w-full items-center gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-lg",
      )}
    >
      <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
      <span className="truncate">{toast.message}</span>
    </div>
  );
}

export function Toaster() {
  const [state, dispatch] = useReducer(toastReducer, initialToastState);

  useEffect(() => {
    pushToast = (message: string) => dispatch({ type: "push", message });
    return () => {
      pushToast = null;
    };
  }, []);

  if (state.toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[110] mx-auto flex w-full max-w-sm flex-col items-stretch gap-2 px-4"
    >
      {state.toasts.map((item) => (
        <ToastItem
          key={item.id}
          toast={item}
          onDone={(id) => dispatch({ type: "dismiss", id })}
        />
      ))}
    </div>
  );
}
