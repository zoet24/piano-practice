import { useNoteMode } from "../contexts/NoteModeContext";

interface Note {
  type: "white" | "black";
  note: string;
}

const NOTES = [
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

export function useNotes(): Note[] {
  const { mode } = useNoteMode();

  return NOTES.map((key) => ({
    type: key.type,
    note: mode === "notes-sharp" ? key.noteSharp : key.noteSharp,
  }));
}
