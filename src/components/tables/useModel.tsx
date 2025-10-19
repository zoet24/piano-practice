import { useMemo } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { CHORD_TYPES, CHORDS } from "../../data/chords";
import { NOTES, useNoteLabel, useNotes } from "../../data/notes";
import { SCALE_TYPES } from "../../data/scales";

export const useMusicTableModel = (
  isTestMode: boolean,
  onItemClick: (itemId: string) => void
) => {
  const { viewMode } = useControls();
  const notes = useNotes();
  const getNoteLabel = useNoteLabel();

  const types = useMemo(
    () => (viewMode === "view-chords" ? CHORD_TYPES : SCALE_TYPES),
    [viewMode]
  );

  const handleItemClick = (itemId: string) => {
    if (!isTestMode) onItemClick(itemId);
  };

  const formatScaleLabel = (note: string, type: string): string => {
    const typeMap: Record<string, string> = {
      major: "major",
      minor: "minor",
      dorian: "dorian",
      mixolydian: "mix",
      pentatonic: "pent",
      blues: "blues",
    };
    const suffix = typeMap[type] ?? type;
    return `${note} ${suffix}`;
  };

  const getItemId = (note: string, type: string): string => {
    const noteEntry = NOTES.find(
      (n) => n.noteSharp === note || n.noteFlat === note
    );
    const root = noteEntry?.noteSharp ?? note;

    if (viewMode === "view-scales") {
      return `${root}-${type}`;
    } else {
      switch (type) {
        case "major":
          return root;
        case "minor":
          return `${root}m`;
        case "7th":
          return `${root}7`;
        case "maj7":
          return `${root}maj7`;
        case "min7":
          return `${root}min7`;
        case "dim":
          return `${root}dim`;
        case "aug":
          return `${root}aug`;
        default:
          return root;
      }
    }
  };

  const getCellData = (noteLabel: string, type: string) => {
    const itemId = getItemId(noteLabel, type);

    if (viewMode === "view-chords") {
      const chord = CHORDS[itemId];
      return chord
        ? { id: itemId, label: getNoteLabel(chord.name), exists: true }
        : { id: itemId, label: "—", exists: false };
    }

    return {
      id: itemId,
      label: formatScaleLabel(noteLabel, type),
      exists: true,
    };
  };

  return {
    viewMode,
    types,
    notes,
    getCellData,
    handleItemClick,
  };
};
