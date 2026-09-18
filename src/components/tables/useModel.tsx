import { useMemo } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useProgress } from "../../contexts/useProgress";
import { CHORD_TYPES, CHORDS, getChordId } from "../../data/chords";
import { NOTES, useNoteLabel, useNotes } from "../../data/notes";
import {
  getChordPracticeId,
  getScalePracticeId,
} from "../../data/practiceItems";
import { SCALE_TYPES } from "../../data/scales";

export interface TableSelection {
  selectedIds: Set<string>;
  // toggles a group of practice ids: selects all of them unless all are already selected
  onToggle: (practiceIds: string[]) => void;
}

export const useMusicTableModel = (
  onItemClick: (itemId: string) => void,
  selection?: TableSelection
) => {
  const { viewMode } = useControls();
  const { getConfidence } = useProgress();
  const notes = useNotes();
  const getNoteLabel = useNoteLabel();

  const types = useMemo(
    () => (viewMode === "view-chords" ? CHORD_TYPES : SCALE_TYPES),
    [viewMode]
  );

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

    return viewMode === "view-scales"
      ? `${root}-${type}`
      : getChordId(root, type);
  };

  const getCellData = (noteLabel: string, type: string) => {
    const itemId = getItemId(noteLabel, type);

    if (viewMode === "view-chords") {
      const chord = CHORDS[itemId];
      const practiceId = getChordPracticeId(itemId);
      return chord
        ? {
            id: itemId,
            practiceId,
            label: getNoteLabel(chord.name),
            exists: true,
            confidence: getConfidence(practiceId),
            isSelected: !!selection?.selectedIds.has(practiceId),
          }
        : {
            id: itemId,
            practiceId,
            label: "—",
            exists: false,
            confidence: 0 as const,
            isSelected: false,
          };
    }

    const practiceId = getScalePracticeId(itemId);
    return {
      id: itemId,
      practiceId,
      label: formatScaleLabel(noteLabel, type),
      exists: true,
      confidence: getConfidence(practiceId),
      isSelected: !!selection?.selectedIds.has(practiceId),
    };
  };

  const getPracticeIds = (cells: { noteLabel: string; type: string }[]) =>
    cells
      .map(({ noteLabel, type }) => getCellData(noteLabel, type))
      .filter((cell) => cell.exists)
      .map((cell) => cell.practiceId);

  const handleItemClick = (itemId: string, practiceId: string) => {
    if (selection) selection.onToggle([practiceId]);
    else onItemClick(itemId);
  };

  const handleColumnClick = (type: string) =>
    selection?.onToggle(
      getPracticeIds(notes.map((n) => ({ noteLabel: n.note, type })))
    );

  const handleRowClick = (noteLabel: string) =>
    selection?.onToggle(
      getPracticeIds(Object.keys(types).map((type) => ({ noteLabel, type })))
    );

  return {
    viewMode,
    types,
    notes,
    getCellData,
    handleItemClick,
    handleColumnClick,
    handleRowClick,
    isSelecting: !!selection,
  };
};
