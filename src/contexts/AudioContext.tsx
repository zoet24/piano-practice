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

const FADE_OUT_SECONDS = 0.6;

const AudioCtx = createContext<AudioContextValue | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const ctxRef = useRef<AudioContext | null>(null);
  const buffers = useRef<Record<string, AudioBuffer>>({});
  const [notesToPlay, setNotesToPlay] = useState<NoteSpec[]>([]);
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const [isAudioReady, setIsAudioReady] = useState(false);

  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    return ctxRef.current;
  };

  useEffect(() => {
    const ctx = getCtx();
    const octaves = [2, 3, 4];

    // Fetch and decode every sample once, so playback needs no network or decoding
    const loads = NOTES.flatMap((note) =>
      octaves.map(async (octave) => {
        const key = `${note.noteFlat}${octave}`;
        try {
          const res = await fetch(`/audio/piano/${key}.mp3`);
          const data = await res.arrayBuffer();
          buffers.current[key] = await ctx.decodeAudioData(data);
        } catch (err) {
          console.warn(`Audio load failed for ${key}:`, err);
        }
      })
    );

    Promise.all(loads).then(() => setIsAudioReady(true));
  }, []);

  const playNotes = (specs: NoteSpec[], type: "chord" | "scale") => {
    if (!isAudioReady) return;

    const ctx = getCtx();
    // Browsers keep the context suspended until a user gesture
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;

    specs.forEach((spec, i) => {
      if (spec.keyIndex === undefined) return;
      const keyIndex = spec.keyIndex;
      const buffer = buffers.current[`${spec.note}${spec.octave}`];
      if (!buffer) return;

      const delay = type === "scale" ? i * 0.25 : 0; // stagger notes for scales

      const startAt = now + delay;
      const endAt = startAt + buffer.duration;

      // Samples are trimmed while still ringing, so fade out the tail instead of stopping abruptly
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, Math.max(startAt, endAt - FADE_OUT_SECONDS));
      gain.gain.linearRampToValueAtTime(0, endAt);
      gain.connect(ctx.destination);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gain);

      // Remove from active keys when audio ends
      source.onended = () => {
        setActiveKeys((prev) => {
          const next = new Set(prev);
          next.delete(keyIndex);
          return next;
        });
      };

      source.start(startAt);

      // Add key to active keys
      if (type === "scale") {
        setTimeout(() => setActiveKeys(new Set([keyIndex])), delay * 1000);
      } else {
        setActiveKeys((prev) => {
          const next = new Set(prev);
          next.add(keyIndex);
          return next;
        });
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
