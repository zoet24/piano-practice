import React, { createContext, useContext, useRef, useState } from "react";

type ActiveKeysSet = Set<number>;

export type PlaySpec = {
  note: string;
  octave: number;
  keyIndex?: number;
};

export type AudioContextValue = {
  activeKeys: ActiveKeysSet;
  playKey: (spec: PlaySpec) => void; // play single note
  playChord: (specs: PlaySpec[]) => void; // play simultaneously
  playSequence: (specs: PlaySpec[], delayMs?: number) => void; // play sequentially
  preload?: (specs: PlaySpec[]) => void;
};

const AudioCtx = createContext<AudioContextValue | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cache = useRef<Record<string, HTMLAudioElement>>({});
  const [activeKeys, setActiveKeys] = useState<ActiveKeysSet>(new Set());

  const audioKeyFor = (note: string, octave: number) => `${note}${octave}`;

  const getAudio = (note: string, octave: number) => {
    const key = audioKeyFor(note, octave);
    if (!cache.current[key]) {
      cache.current[key] = new Audio(`/audio/piano/${key}.mp3`);
    }
    return cache.current[key];
  };

  const markActive = (keyIndex?: number) => {
    if (typeof keyIndex !== "number") return;
    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.add(keyIndex);
      return next;
    });
  };

  const unmarkActive = (keyIndex?: number) => {
    if (typeof keyIndex !== "number") return;
    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.delete(keyIndex);
      return next;
    });
  };

  // play single note; highlights keyIndex (if provided) until ended
  const playKey = ({ note, octave, keyIndex }: PlaySpec) => {
    try {
      const audio = getAudio(note, octave);
      const clone = audio.cloneNode(true) as HTMLAudioElement;
      markActive(keyIndex);
      clone.currentTime = 0;
      clone.play().catch((e) => {
        console.warn("Audio play failed", e);
        unmarkActive(keyIndex);
      });
      clone.addEventListener("ended", () => {
        unmarkActive(keyIndex);
      });
      clone.addEventListener("error", () => unmarkActive(keyIndex));
    } catch (err) {
      console.error("playKey error", err);
    }
  };

  // play multiple simultaneously
  const playChord = (specs: PlaySpec[]) => {
    specs.forEach((s) => playKey(s));
  };

  // play sequentially with optional delay between notes
  const playSequence = async (specs: PlaySpec[], delayMs = 300) => {
    for (let i = 0; i < specs.length; i++) {
      const s = specs[i];
      playKey(s);
      // wait delay
      await new Promise((res) => setTimeout(res, delayMs));
    }
  };

  const preload = (specs: PlaySpec[]) => {
    specs.forEach((s) => {
      try {
        getAudio(s.note, s.octave);
      } catch {
        /* ignore */
      }
    });
  };

  return (
    <AudioCtx.Provider
      value={{ activeKeys, playKey, playChord, playSequence, preload }}
    >
      {children}
    </AudioCtx.Provider>
  );
};

export const useAudio = (): AudioContextValue => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
};
