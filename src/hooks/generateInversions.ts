import type { Chord } from "../data/chords";
import type { Note } from "../data/notes";

export type DisplayChord = Chord & { notes: string[] };

export function generateInversions(
  chord: Chord,
  notes: Note[]
): DisplayChord[] {
  const inversions: DisplayChord[] = [];
  const numNotes = chord.pianoKeys.length;
  if (numNotes < 2) return inversions;

  for (let i = 1; i < numNotes; i++) {
    // Rotate chord
    const rotatedKeys = [
      ...chord.pianoKeys.slice(i),
      ...chord.pianoKeys.slice(0, i),
    ];

    // Ensure strictly ascending keys
    const normalizedKeys: number[] = [];
    let lastKey = -1;
    for (const k of rotatedKeys) {
      let keyIndex = k;
      while (keyIndex <= lastKey) keyIndex += 12;
      normalizedKeys.push(keyIndex);
      lastKey = keyIndex;
    }

    // Map to note names
    const rotatedNotes = normalizedKeys.map((k) => notes[k % 12].note);

    const inversionName = `${chord.name}/${rotatedNotes[0]}`;
    const inversionFullName = `${chord.fullName} ${ordinal(i)} Inversion`;

    inversions.push({
      ...chord,
      name: inversionName,
      fullName: inversionFullName,
      pianoKeys: normalizedKeys,
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
