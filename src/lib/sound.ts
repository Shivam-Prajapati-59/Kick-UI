import { useState } from "react";
import { createUISFX, type CueName, type UISFXPlayer } from "uisfx";

/**
 * Centralized UI sound module (uisfx, `minimal` pack).
 *
 * One lazy, client-only player shared by the whole app. The module never
 * touches window/Audio at import time, so importing it during SSR or in
 * tests is safe; the player is created on first use, which always happens
 * inside a genuine user gesture (copy click, toggle click).
 *
 * Sound is used sparingly and only for committed outcomes: copy success
 * and the sound toggle itself. No loops are started anywhere; if that ever
 * changes, stop them before outcomes and on disable (see setSoundEnabled).
 */

export const SOUND_PACK = "minimal" as const;
export const SOUND_VOLUME = 1;
export const SOUND_STORAGE_KEY = "kick-ui-sound";

/** Product action -> semantic cue. Only committed outcomes get a cue. */
export const ACTION_CUES = {
  copy: "copy",
  toggleOn: "toggle-on",
  toggleOff: "toggle-off",
} as const satisfies Record<string, CueName>;

export type SoundAction = keyof typeof ACTION_CUES;

/* ------------------------------------------------------------------ */
/*  Preference storage (injectable for tests)                           */
/* ------------------------------------------------------------------ */

export interface SoundStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function browserStorage(): SoundStorage | null {
  if (typeof window === "undefined") return null;
  try {
    window.localStorage.setItem("__kick-ui-sound-probe__", "1");
    window.localStorage.removeItem("__kick-ui-sound-probe__");
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Stored format matches usePersistedState (JSON boolean). Absent/corrupt = on. */
export function loadSoundEnabled(storage?: SoundStorage | null): boolean {
  const store = storage === undefined ? browserStorage() : storage;
  if (!store) return true;
  try {
    const raw = store.getItem(SOUND_STORAGE_KEY);
    if (raw === null) return true;
    return JSON.parse(raw) !== false;
  } catch {
    return true;
  }
}

export function saveSoundEnabled(
  enabled: boolean,
  storage?: SoundStorage | null,
): void {
  const store = storage === undefined ? browserStorage() : storage;
  try {
    store?.setItem(SOUND_STORAGE_KEY, JSON.stringify(enabled));
  } catch {
    // Preference persistence is best-effort; never break the UI.
  }
}

/* ------------------------------------------------------------------ */
/*  Player holder (lazy singleton, remount-safe)                        */
/* ------------------------------------------------------------------ */

export function createPlayerHolder(create: () => UISFXPlayer | null): {
  get: () => UISFXPlayer | null;
  destroy: () => Promise<void>;
} {
  let player: UISFXPlayer | null | undefined;
  return {
    get() {
      if (player === undefined) player = create();
      return player;
    },
    async destroy() {
      const current = player;
      player = undefined;
      await current?.destroy();
    },
  };
}

function createBrowserPlayer(): UISFXPlayer | null {
  if (typeof window === "undefined") return null;
  try {
    return createUISFX({
      pack: SOUND_PACK,
      volume: SOUND_VOLUME,
      enabled: loadSoundEnabled(),
    });
  } catch {
    return null;
  }
}

const holder = createPlayerHolder(createBrowserPlayer);

/** Returns the shared player, or null during SSR / when unsupported. */
export function getSoundPlayer(): UISFXPlayer | null {
  return holder.get();
}

/** Disposes the shared player; the next get() creates a fresh one. */
export function destroySoundPlayer(): Promise<void> {
  return holder.destroy();
}

/* ------------------------------------------------------------------ */
/*  Playback                                                            */
/* ------------------------------------------------------------------ */

/** Plays a cue. Returns false when suppressed (SSR, disabled, locked). */
export function playCue(cue: CueName): boolean {
  try {
    const result = getSoundPlayer()?.play(cue);
    return result !== null && result !== undefined;
  } catch {
    return false;
  }
}

/** Copy success cue. Call only after the clipboard write resolves. */
export function playCopyCue(): boolean {
  return playCue(ACTION_CUES.copy);
}

/**
 * Resumes Web Audio from the calling gesture. Call synchronously at the
 * top of pointer/keyboard handlers, before any await — playback that
 * follows in the same gesture window is then unlocked.
 */
export function unlockSound(): Promise<boolean> {
  try {
    return getSoundPlayer()?.unlock() ?? Promise.resolve(false);
  } catch {
    return Promise.resolve(false);
  }
}

export function isSoundEnabled(): boolean {
  try {
    return getSoundPlayer()?.isEnabled() ?? loadSoundEnabled();
  } catch {
    return loadSoundEnabled();
  }
}

/**
 * Applies the persisted preference to the player. Mute is immediate:
 * any active output is stopped first. (No loops are started anywhere in
 * this product; if one ever is, stop its handle here before setEnabled.)
 */
export function setSoundEnabled(enabled: boolean): void {
  saveSoundEnabled(enabled);
  try {
    const player = getSoundPlayer();
    if (!enabled) player?.stopAll();
    player?.setEnabled(enabled);
  } catch {
    // Player unavailable — the persisted value still applies on next load.
  }
}

/* ------------------------------------------------------------------ */
/*  Once-per-cycle copy chime                                           */
/* ------------------------------------------------------------------ */

/**
 * A copy button shows transient "Copied!" feedback for ~2s. The chime
 * plays on the first successful copy of a cycle and stays silent on
 * repeat clicks until reset() runs alongside the visual reset — so the
 * sound re-arms exactly when the button returns to "Copy".
 */
export function createCopyChime(play: () => void = playCopyCue): {
  chime: () => boolean;
  reset: () => void;
} {
  let chimed = false;
  return {
    chime() {
      if (chimed) return false;
      chimed = true;
      play();
      return true;
    },
    reset() {
      chimed = false;
    },
  };
}

export function useCopyChime(): ReturnType<typeof createCopyChime> {
  // Lazy initializer (never a ref read during render); the factory has no
  // side effects, so a StrictMode double-invoke safely discards one copy.
  const [chime] = useState(() => createCopyChime());
  return chime;
}
