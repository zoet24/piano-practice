import { useNoteMode } from "../contexts/NoteModeContext";

export interface Note {
  type: "white" | "black";
  note: string;
}

export const NOTES = [
  { type: "white", noteSharp: "C", noteFlat: "C" },
  { type: "black", noteSharp: "C#", noteFlat: "Db" },
  { type: "white", noteSharp: "D", noteFlat: "D" },
  { type: "black", noteSharp: "D#", noteFlat: "Eb" },
  { type: "white", noteSharp: "E", noteFlat: "E" },
  { type: "white", noteSharp: "F", noteFlat: "F" },
  { type: "black", noteSharp: "F#", noteFlat: "Gb" },
  { type: "white", noteSharp: "G", noteFlat: "G" },
  { type: "black", noteSharp: "G#", noteFlat: "Ab" },
  { type: "white", noteSharp: "A", noteFlat: "A" },
  { type: "black", noteSharp: "A#", noteFlat: "Bb" },
  { type: "white", noteSharp: "B", noteFlat: "B" },
] as const;

export const useNoteLabel = () => {
  const { mode } = useNoteMode();

  const getNoteLabel = (chordName: string): string => {
    // Extract root note (first character + optional #)
    const match = chordName.match(/^[A-G]#?/);
    if (!match) return chordName;

    const root = match[0];
    const suffix = chordName.slice(root.length);

    const noteObj = NOTES.find(
      (n) => n.noteSharp === root || n.noteFlat === root
    );
    if (!noteObj) return chordName;

    const displayRoot =
      mode === "notes-sharp" ? noteObj.noteSharp : noteObj.noteFlat;
    return displayRoot + suffix;
  };

  return getNoteLabel;
};

export const useNotes = (): Note[] => {
  const { mode } = useNoteMode();

  return NOTES.map((key) => ({
    type: key.type,
    note: mode === "notes-sharp" ? key.noteSharp : key.noteFlat,
  }));
};
