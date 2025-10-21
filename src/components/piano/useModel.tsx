import { useEffect, useMemo } from "react";
import { useAudio, type NoteSpec } from "../../contexts/AudioContext";
import { useNotes } from "../../data/notes";
import type { KeyAnnotation, ViewMode } from "../modals/useModel";

export interface UsePianoKeysProps {
  annotations?: KeyAnnotation[];
  octaves?: number;
  viewMode?: ViewMode;
  type?: "chord" | "scale";
}

export const usePianoKeys = ({
  annotations = [],
  octaves = 3,
}: UsePianoKeysProps) => {
  const notes = useNotes();
  const { setNotesToPlay, playNotes, activeKeys } = useAudio();

  // Expand keys across N octaves
  const keys = useMemo(() => {
    const startingOctave = 2;
    return Array.from({ length: octaves }, (_, octave) =>
      notes.map((k, i) => ({
        ...k,
        keyIndex: i + octave * 12,
        octave: startingOctave + octave,
      }))
    ).flat();
  }, [notes, octaves]);

  useEffect(() => {
    if (!annotations.length) return;

    const notesToPlay = annotations
      .map((a) => {
        const key = keys.find((k) => k.keyIndex === a.keyIndex);
        if (!key) return null;
        return {
          note: key.audioNote,
          octave: key.octave,
          keyIndex: key.keyIndex,
        };
      })
      .filter(Boolean) as NoteSpec[];

    setNotesToPlay((prev) => {
      const isEqual =
        prev.length === notesToPlay.length &&
        prev.every(
          (n, i) =>
            n.note === notesToPlay[i].note && n.octave === notesToPlay[i].octave
        );
      return isEqual ? prev : notesToPlay;
    });
  }, [annotations, keys, setNotesToPlay]);

  const handlePlayNote = (key: NoteSpec) => {
    playNotes([key], "chord");
  };

  const getKeyClasses = (
    keyIndex: number,
    type: string,
    annotations: KeyAnnotation[]
  ) => {
    const keyAnnotations = annotations.filter((a) => a.keyIndex === keyIndex);

    let keyClass = "";
    if (keyAnnotations.some((a) => a.label.startsWith("LH")))
      keyClass = "bg-blue-500";
    else if (keyAnnotations.some((a) => a.label.startsWith("RH")))
      keyClass = "bg-teal-500";

    if (activeKeys.has(keyIndex)) keyClass = "bg-blue-300";

    if (
      type === "black" &&
      (keyAnnotations.length > 0 || activeKeys.has(keyIndex))
    ) {
      keyClass += " outline outline-black";
    }

    let noteClass = "";
    if (
      keyAnnotations.some(
        (a) => a.label.startsWith("LH") || a.label.startsWith("RH")
      )
    ) {
      noteClass = "text-black";
    } else {
      noteClass = "text-gray-400";
    }

    return { keyClass, noteClass, keyAnnotations };
  };

  return { keys, handlePlayNote, getKeyClasses, activeKeys };
};
