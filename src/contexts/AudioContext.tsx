import React, { createContext, useContext, useRef, useState } from "react";

export type NoteSpec = {
  note: string;
  octave: number;
  keyIndex?: number;
};

export type AudioContextValue = {
  notesToPlay: NoteSpec[];
  setNotesToPlay: React.Dispatch<React.SetStateAction<NoteSpec[]>>;
  activeKeys: Set<number>;
  setActiveKeys: React.Dispatch<React.SetStateAction<Set<number>>>;
  playNotes: (notes: NoteSpec[], type: "chord" | "scale") => void;
};

const AudioCtx = createContext<AudioContextValue | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cache = useRef<Record<string, HTMLAudioElement>>({});
  const [notesToPlay, setNotesToPlay] = useState<NoteSpec[]>([]);
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());

  const getAudio = (note: string, octave: number) => {
    const key = `${note}${octave}`;
    if (!cache.current[key]) {
      cache.current[key] = new Audio(`/audio/piano/${key}.mp3`);
    }
    return cache.current[key];
  };

  const playNotes = (specs: NoteSpec[], type: "chord" | "scale") => {
    specs.forEach((spec, i) => {
      const playSingleNote = () => {
        if (spec.keyIndex === undefined) return;

        // Add key to active keys
        setActiveKeys((prev) => {
          const next = new Set(prev);
          next.add(spec.keyIndex!);
          return next;
        });

        const audio = getAudio(spec.note, spec.octave);
        const clone = audio.cloneNode(true) as HTMLAudioElement;
        clone.currentTime = 0;

        // Remove from active keys when audio ends
        clone.addEventListener("ended", () => {
          setActiveKeys((prev) => {
            const next = new Set(prev);
            next.delete(spec.keyIndex!);
            return next;
          });
        });

        clone.play().catch((err) => console.warn("Audio play failed:", err));
      };

      if (type === "chord") {
        playSingleNote();
      } else {
        setTimeout(playSingleNote, i * 250); // stagger notes for scales
      }
    });
  };

  return (
    <AudioCtx.Provider
      value={{
        notesToPlay,
        setNotesToPlay,
        activeKeys,
        setActiveKeys,
        playNotes,
      }}
    >
      {children}
    </AudioCtx.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
};
