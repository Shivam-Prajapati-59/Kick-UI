import { describe, expect, test } from "bun:test";
import {
  TOAST_LIMIT,
  toastReducer,
  type ToastState,
} from "../src/components/feedback/Toaster";

describe("toastReducer", () => {
  test("push assigns incrementing ids", () => {
    const first = toastReducer(
      { toasts: [], nextId: 1 },
      { type: "push", message: "a" },
    );
    expect(first.toasts).toHaveLength(1);
    expect(first.toasts[0].id).toBe(1);
    const second = toastReducer(first, { type: "push", message: "b" });
    expect(second.toasts.map((toast) => toast.id)).toEqual([1, 2]);
    expect(second.nextId).toBe(3);
  });

  test("dismiss removes only the targeted toast", () => {
    const state = toastReducer(
      { toasts: [], nextId: 1 },
      { type: "push", message: "a" },
    );
    const two = toastReducer(state, { type: "push", message: "b" });
    const one = toastReducer(two, { type: "dismiss", id: 1 });
    expect(one.toasts.map((toast) => toast.id)).toEqual([2]);
    expect(toastReducer(one, { type: "dismiss", id: 999 })).toEqual(one);
  });

  test("visible toasts are capped, ids keep incrementing", () => {
    let state: ToastState = { toasts: [], nextId: 1 };
    for (let index = 0; index < TOAST_LIMIT + 2; index += 1) {
      state = toastReducer(state, { type: "push", message: `m${index}` });
    }
    expect(state.toasts).toHaveLength(TOAST_LIMIT);
    expect(state.nextId).toBe(TOAST_LIMIT + 3);
  });
});
