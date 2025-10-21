import React, { createContext, useContext, useRef, useState } from "react";

export type NoteSpec = {
  note: string;
  octave: number;
  keyIndex?: number;
};

export type AudioContextValue = {
  notesToPlay: NoteSpec[];
  setNotesToPlay: React.Dispatch<React.SetStateAction<NoteSpec[]>>;
  playNotes: (notes: NoteSpec[], type: "chord" | "scale") => void;
};

const AudioCtx = createContext<AudioContextValue | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cache = useRef<Record<string, HTMLAudioElement>>({});
  const [notesToPlay, setNotesToPlay] = useState<NoteSpec[]>([]);

  const getAudio = (note: string, octave: number) => {
    const key = `${note}${octave}`;
    if (!cache.current[key]) {
      cache.current[key] = new Audio(`/audio/piano/${key}.mp3`);
    }
    return cache.current[key];
  };

  const playNote = (spec: NoteSpec) => {
    const audio = getAudio(spec.note, spec.octave);
    const clone = audio.cloneNode(true) as HTMLAudioElement;
    clone.currentTime = 0;
    clone.play().catch((err) => console.warn("Audio play failed:", err));
  };

  const playNotes = (specs: NoteSpec[], type: "chord" | "scale") => {
    if (type === "chord") {
      specs.forEach(playNote);
    } else {
      specs.forEach((n, i) => setTimeout(() => playNote(n), i * 250));
    }
  };

  return (
    <AudioCtx.Provider value={{ notesToPlay, setNotesToPlay, playNotes }}>
      {children}
    </AudioCtx.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
};
