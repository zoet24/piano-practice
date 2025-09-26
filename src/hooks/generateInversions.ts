import type { Chord } from "../data/chords";
import type { Note } from "../data/notes";

export type DisplayChord = Chord & { notes: string[] };

/**
 * Generates inversions for a chord using a provided notes array (context-aware sharp/flat)
 */
export function generateInversions(
  chord: Chord,
  notes: Note[]
): DisplayChord[] {
  const inversions: DisplayChord[] = [];
  const numNotes = chord.pianoKeys.length;
  if (numNotes < 2) return inversions;

  for (let i = 1; i < numNotes; i++) {
    // Rotate piano keys and push wrapped notes up an octave
    const rotatedKeys = chord.pianoKeys
      .slice(i)
      .concat(chord.pianoKeys.slice(0, i).map((k) => k + 12));

    // Derive note names from the provided notes array
    const rotatedNotes = rotatedKeys.map((k) => notes[k % 12].note);

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
