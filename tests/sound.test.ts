import { describe, expect, test } from "bun:test";
import { cueNames, packNames, type UISFXPlayer } from "uisfx";
import {
  ACTION_CUES,
  SOUND_PACK,
  SOUND_STORAGE_KEY,
  SOUND_VOLUME,
  createCopyChime,
  createPlayerHolder,
  destroySoundPlayer,
  getSoundPlayer,
  isSoundEnabled,
  loadSoundEnabled,
  playCue,
  saveSoundEnabled,
  setSoundEnabled,
  unlockSound,
  type SoundStorage,
} from "../src/lib/sound";

function fakeStorage(initial: Record<string, string> = {}): SoundStorage & {
  written: Record<string, string>;
} {
  const written: Record<string, string> = { ...initial };
  return {
    written,
    getItem: (key: string) => (key in written ? written[key] : null),
    setItem: (key: string, value: string) => {
      written[key] = value;
    },
  };
}

describe("sound constants", () => {
  test("selected pack exists in the uisfx catalog", () => {
    expect((packNames as readonly string[]).includes(SOUND_PACK)).toBe(true);
  });

  test("every mapped cue is a valid uisfx cue name", () => {
    const names = cueNames as readonly string[];
    for (const cue of Object.values(ACTION_CUES)) {
      expect(names.includes(cue)).toBe(true);
    }
  });

  test("copy maps to the copy cue at the specified volume", () => {
    expect(ACTION_CUES.copy).toBe("copy");
    expect(SOUND_VOLUME).toBe(0.7);
  });
});

describe("createCopyChime", () => {
  test("plays once per cycle and re-arms on reset", () => {
    let plays = 0;
    const chime = createCopyChime(() => {
      plays += 1;
    });
    expect(chime.chime()).toBe(true);
    expect(plays).toBe(1);
    expect(chime.chime()).toBe(false);
    expect(plays).toBe(1);
    chime.reset();
    expect(chime.chime()).toBe(true);
    expect(plays).toBe(2);
  });
});

describe("sound preference storage", () => {
  test("absent value defaults to on", () => {
    expect(loadSoundEnabled(fakeStorage())).toBe(true);
  });

  test("round-trips through the persisted format", () => {
    const store = fakeStorage();
    saveSoundEnabled(false, store);
    expect(store.written[SOUND_STORAGE_KEY]).toBe("false");
    expect(loadSoundEnabled(store)).toBe(false);
    saveSoundEnabled(true, store);
    expect(loadSoundEnabled(store)).toBe(true);
  });

  test("corrupt values and dead storage fall back to on without throwing", () => {
    expect(
      loadSoundEnabled(fakeStorage({ [SOUND_STORAGE_KEY]: "bogus" })),
    ).toBe(true);
    const dead: SoundStorage = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    expect(loadSoundEnabled(dead)).toBe(true);
    saveSoundEnabled(false, dead);
  });
});

describe("SSR and unsupported environments", () => {
  test("player accessors degrade gracefully without a window", () => {
    expect(getSoundPlayer()).toBe(null);
    expect(playCue("copy")).toBe(false);
    expect(isSoundEnabled()).toBe(true);
  });

  test("unlock and destroy resolve without throwing", async () => {
    await expect(unlockSound()).resolves.toBe(false);
    await expect(destroySoundPlayer()).resolves.toBeUndefined();
  });

  test("setSoundEnabled never throws without a player", () => {
    setSoundEnabled(false);
    setSoundEnabled(true);
  });
});

describe("createPlayerHolder", () => {
  test("creates once across gets and recreates after destroy", async () => {
    let creations = 0;
    const holder = createPlayerHolder(() => {
      creations += 1;
      return { destroy: async () => {} } as unknown as UISFXPlayer;
    });
    expect(holder.get()).not.toBe(null);
    expect(holder.get()).not.toBe(null);
    expect(creations).toBe(1);
    await holder.destroy();
    expect(holder.get()).not.toBe(null);
    expect(creations).toBe(2);
  });

  test("destroy before creation resolves", async () => {
    const holder = createPlayerHolder(() => null);
    await expect(holder.destroy()).resolves.toBeUndefined();
    expect(holder.get()).toBe(null);
  });
});
