"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePersistedState } from "@/hooks/useCodeOptions";
import {
  ACTION_CUES,
  playCue,
  setSoundEnabled,
  unlockSound,
} from "@/lib/sound";

export interface SoundToggleButtonProps {
  className?: string;
}

/**
 * Accessible interface-sound toggle. State persists via the shared
 * persisted-preference hook (localStorage, `kick-ui-sound`) and is applied
 * to the shared player, so every page follows it without remount work.
 *
 * Enabling plays the resulting-state cue; muting is silent and immediate.
 * Visual feedback (icon swap) always mirrors the state — sound never
 * carries meaning alone.
 */
export const SoundToggleButton = ({ className }: SoundToggleButtonProps) => {
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = usePersistedState<boolean>("sound", true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Keep a cross-tab or programmatic preference change applied to the player.
  useEffect(() => {
    setSoundEnabled(enabled);
  }, [enabled]);

  const handleClick = useCallback(() => {
    if (enabled) {
      setEnabled(false);
      setSoundEnabled(false);
      return;
    }
    setEnabled(true);
    setSoundEnabled(true);
    void (async () => {
      await unlockSound();
      playCue(ACTION_CUES.toggleOn);
    })();
  }, [enabled, setEnabled]);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className={className} disabled>
        <div className="h-[1.2rem] w-[1.2rem] shrink-0" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute interface sounds" : "Unmute interface sounds"}
      title={enabled ? "Mute interface sounds" : "Unmute interface sounds"}
      className={cn("hover:bg-accent transition-colors", className)}
    >
      {enabled ? (
        <Volume2 className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <VolumeX className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
};
