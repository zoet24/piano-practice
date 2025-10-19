import { useMemo, useState } from "react";
import { CHORDS, type Chord } from "../../data/chords";
import { useNoteLabel, useNotes } from "../../data/notes";
import { SCALES, type Scale } from "../../data/scales";
import { generateInversions } from "../../hooks/generateInversions";
import {
  mapChordKeysToAnnotations,
  mapScaleKeysToAnnotations,
} from "../../hooks/mapKeysToAnnotations";

export type ViewMode = "none" | "annotations" | "all" | "notes";

export interface KeyAnnotation {
  keyIndex: number;
  label: string;
}

const createHandOptions = (
  lhAnnotations: KeyAnnotation[],
  rhAnnotations: KeyAnnotation[]
) => {
  return [
    { key: "left", label: "Left Hand", getAnnotations: () => lhAnnotations },
    {
      key: "both",
      label: "Both Hands",
      getAnnotations: () => [...lhAnnotations, ...rhAnnotations],
    },
    { key: "right", label: "Right Hand", getAnnotations: () => rhAnnotations },
  ] as const;
};

export const useChordModel = (itemId: string) => {
  if (!itemId) return null;

  const rootChord: Chord = CHORDS[itemId];
  if (!rootChord) return null;

  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const modes: ViewMode[] = ["none", "annotations", "all", "notes"];
  const handleViewModeChange = () =>
    setViewMode((prev) => modes[(modes.indexOf(prev) + 1) % modes.length]);

  const notes = useNotes();
  const getNoteLabel = useNoteLabel();

  const inversions = useMemo(
    () => generateInversions(rootChord, notes),
    [rootChord, notes]
  );

  const allChords = useMemo(
    () => [rootChord, ...inversions],
    [inversions, rootChord]
  );

  const [selectedChordName, setSelectedChordName] = useState(rootChord.name);

  const selectedChord = useMemo(
    () => allChords.find((ch) => ch.name === selectedChordName) ?? rootChord,
    [selectedChordName, allChords, rootChord]
  );

  const selectedChordNotes = useMemo(
    () => selectedChord.pianoKeys.map((k) => notes[k % 12].note),
    [selectedChord, notes]
  );

  const { lhAnnotations, rhAnnotations } = useMemo(
    () => mapChordKeysToAnnotations(selectedChord),
    [selectedChord]
  );

  const handOptions = useMemo(
    () => createHandOptions(lhAnnotations, rhAnnotations),
    [lhAnnotations, rhAnnotations]
  );

  return {
    rootChord,
    allChords,
    selectedChord,
    selectedChordName,
    setSelectedChordName,
    selectedChordNotes,
    getNoteLabel,
    handOptions,
    viewMode,
    handleViewModeChange,
  };
};

export const useScaleModel = (itemId: string) => {
  if (!itemId) return null;

  const rootScale: Scale = SCALES[itemId];
  if (!rootScale) return null;

  const notes = useNotes();
  const getNoteLabel = useNoteLabel();

  const scaleNotes = useMemo(
    () => rootScale.pianoKeys.map((k) => notes[k % 12].note),
    [rootScale, notes]
  );

  const { lhAnnotations, rhAnnotations } = useMemo(
    () => mapScaleKeysToAnnotations(rootScale),
    [rootScale]
  );

  const handOptions = useMemo(
    () => createHandOptions(lhAnnotations, rhAnnotations),
    [lhAnnotations, rhAnnotations]
  );

  return {
    rootScale,
    scaleNotes,
    getNoteLabel,
    handOptions,
  };
};
