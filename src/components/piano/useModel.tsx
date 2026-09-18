import { useEffect, useMemo } from "react";
import { useAudio, type NoteSpec } from "../../contexts/AudioContext";
import { NOTES, useNotes } from "../../data/notes";
import type { KeyAnnotation, ViewMode } from "../modals/useModel";

export interface UsePianoKeysProps {
  annotations?: KeyAnnotation[];
  octaves?: number;
  viewMode?: ViewMode;
  type?: "chord" | "scale";
}

const STARTING_OCTAVE = 2;

// keyIndex counts semitones up from C in the starting octave
export const annotationsToNoteSpecs = (
  annotations: KeyAnnotation[],
  octaves = 3
): NoteSpec[] =>
  annotations
    .filter((a) => a.keyIndex >= 0 && a.keyIndex < octaves * 12)
    .map((a) => ({
      note: NOTES[a.keyIndex % 12].noteFlat,
      octave: STARTING_OCTAVE + Math.floor(a.keyIndex / 12),
      keyIndex: a.keyIndex,
    }));

export const usePianoKeys = ({
  annotations = [],
  octaves = 3,
}: UsePianoKeysProps) => {
  const notes = useNotes();
  const { setNotesToPlay, playNotes, activeKeys } = useAudio();

  // Expand keys across N octaves
  const keys = useMemo(() => {
    return Array.from({ length: octaves }, (_, octave) =>
      notes.map((k, i) => ({
        ...k,
        keyIndex: i + octave * 12,
        octave: STARTING_OCTAVE + octave,
      }))
    ).flat();
  }, [notes, octaves]);

  useEffect(() => {
    if (!annotations.length) return;

    const notesToPlay = annotationsToNoteSpecs(annotations, octaves);

    setNotesToPlay((prev) => {
      const isEqual =
        prev.length === notesToPlay.length &&
        prev.every(
          (n, i) =>
            n.note === notesToPlay[i].note && n.octave === notesToPlay[i].octave
        );
      return isEqual ? prev : notesToPlay;
    });
  }, [annotations, octaves, setNotesToPlay]);

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
      keyClass = "bg-keys-left";
    else if (keyAnnotations.some((a) => a.label.startsWith("RH")))
      keyClass = "bg-keys-right";

    if (activeKeys.has(keyIndex)) keyClass = "bg-keys-active";

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
