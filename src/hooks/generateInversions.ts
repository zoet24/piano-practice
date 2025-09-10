import type { Chord } from "../data/chords";
import { CHORD_NOTES } from "../data/chords";

export type DisplayChord = Chord & { notes: string[] };

export function generateInversions(
  chord: Chord,
  mode: "notes-sharp" | "notes-flat" = "notes-sharp"
): DisplayChord[] {
  const inversions: DisplayChord[] = [];
  const numNotes = chord.pianoKeys.length;
  if (numNotes < 2) return inversions;

  for (let i = 1; i < numNotes; i++) {
    // Rotate piano keys and push wrapped notes up an octave
    const rotatedKeys = chord.pianoKeys
      .slice(i)
      .concat(chord.pianoKeys.slice(0, i).map((k) => k + 12));

    // Derive note names from CHORD_NOTES and chosen mode
    const rotatedNotes = rotatedKeys.map((k) => {
      const key = CHORD_NOTES[k % 12];
      return mode === "notes-sharp" ? key.noteSharp : key.noteFlat;
    });

    const inversionName = `${chord.name}/${rotatedNotes[0]}`;
    const inversionFullName = `${chord.fullName} ${ordinal(i)} Inversion`;

    inversions.push({
      ...chord,
      name: inversionName,
      fullName: inversionFullName,
      pianoKeys: rotatedKeys,
      notes: rotatedNotes,
    });
  }

  return inversions;
}

function ordinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}
