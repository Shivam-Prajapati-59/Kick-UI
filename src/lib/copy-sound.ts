/**
 * Copy-click feedback sound.
 *
 * Single module owning the asset path, so swapping the sound later touches
 * one file. Fire-and-forget by design: it only ever runs inside a user
 * gesture (copy button click, which satisfies autoplay policies) and it
 * must never break or delay the copy itself.
 */

const COPY_SOUND_SRC = "/assets/sound/copyclick.mp3";

let audio: HTMLAudioElement | null = null;

export function playCopySound(): void {
  try {
    if (!audio) {
      audio = new Audio(COPY_SOUND_SRC);
      audio.preload = "auto";
    }
    // Rewind so rapid successive copies each replay from the start.
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Audio unavailable or blocked — decorative only, stay silent.
    });
  } catch {
    // Audio constructor unavailable (SSR/test) — stay silent.
  }
}
