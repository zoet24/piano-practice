import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { NOTES } from "../data/notes";

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
  isAudioReady: boolean;
};

const AudioCtx = createContext<AudioContextValue | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cache = useRef<Record<string, HTMLAudioElement>>({});
  const [notesToPlay, setNotesToPlay] = useState<NoteSpec[]>([]);
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const [isAudioReady, setIsAudioReady] = useState(false);

  useEffect(() => {
    const octaves = [2, 3, 4];
    const total = NOTES.length * octaves.length;
    let loaded = 0;

    NOTES.forEach((note) => {
      octaves.forEach((octave) => {
        const key = `${note.noteFlat}${octave}`;
        const audio = new Audio(`/audio/piano/${key}.mp3`);
        audio.preload = "auto";

        audio.addEventListener(
          "canplaythrough",
          () => {
            loaded++;
            if (loaded === total) {
              setIsAudioReady(true);
            }
          },
          { once: true }
        );

        cache.current[key] = audio;
      });
    });
  }, []);

  const getAudio = (note: string, octave: number) => {
    const key = `${note}${octave}`;
    return cache.current[key];
  };

  const playNotes = (specs: NoteSpec[], type: "chord" | "scale") => {
    if (!isAudioReady) return;

    specs.forEach((spec, i) => {
      const playSingleNote = () => {
        if (spec.keyIndex === undefined) return;

        // Add key to active keys
        if (type === "scale") {
          setActiveKeys(new Set([spec.keyIndex]));
        } else {
          setActiveKeys((prev) => {
            const next = new Set(prev);
            next.add(spec.keyIndex!);
            return next;
          });
        }

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
        isAudioReady,
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
