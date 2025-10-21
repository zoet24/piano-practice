import React, { createContext, useContext, useRef } from "react";

export type PlaySpec = {
  note: string;
  octave: number;
};

export type AudioContextValue = {
  playNote: (spec: PlaySpec) => void;
  playChord: (specs: PlaySpec[]) => void;
  playScale: (specs: PlaySpec[], delayMs?: number) => Promise<void>;
  preload: (specs: PlaySpec[]) => void;
};

const AudioCtx = createContext<AudioContextValue | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cache = useRef<Record<string, HTMLAudioElement>>({});

  const getAudio = (note: string, octave: number) => {
    const key = `${note}${octave}`;
    if (!cache.current[key]) {
      cache.current[key] = new Audio(`/audio/piano/${key}.mp3`);
    }
    return cache.current[key];
  };

  const playNote = ({ note, octave }: PlaySpec) => {
    try {
      const base = getAudio(note, octave);
      const audio = base.cloneNode(true) as HTMLAudioElement;
      audio.currentTime = 0;
      audio.play().catch((e) => console.warn("Audio play failed", e));
    } catch (err) {
      console.error("Error playing note:", err);
    }
  };

  const playChord = (specs: PlaySpec[]) => {
    specs.forEach(playNote);
  };

  const playScale = async (specs: PlaySpec[], delayMs = 250) => {
    for (const spec of specs) {
      playNote(spec);
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
    <AudioCtx.Provider value={{ playNote, playChord, playScale, preload }}>
      {children}
    </AudioCtx.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
};
