import { useNoteMode } from "../contexts/NoteModeContext";
import type { Chord } from "../data/chords";
import { NOTES } from "../data/notes";

export function useChordNotes(chord: Chord) {
  const { mode } = useNoteMode();

  // Convert piano keys into visible notes
  const notes = chord.pianoKeys.map((keyIndex) => {
    const key = NOTES[keyIndex % 12];
    return mode === "notes-sharp" ? key.noteSharp : key.noteFlat;
  });

  // Root note determines chord name
  const rootKey = NOTES[chord.pianoKeys[0] % 12];
  const rootName =
    mode === "notes-sharp" ? rootKey.noteSharp : rootKey.noteFlat;

  // Full chord name with context
  const fullName =
    chord.name.includes("m") && !chord.name.includes("maj")
      ? `${rootName} minor`
      : chord.fullName.replace(/^[A-G]#?|b/, rootName);

  return {
    notes,
    rootName,
    fullName,
  };
}
