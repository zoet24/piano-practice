import type { Chord } from "../data/chords";

export function generateInversions(chord: Chord): Chord[] {
  const inversions: Chord[] = [];
  const numNotes = chord.notes.length;

  for (let i = 1; i < numNotes; i++) {
    const rotatedNotes = chord.notes.slice(i).concat(chord.notes.slice(0, i));

    const rotatedKeys = chord.pianoKeys
      .slice(i)
      .concat(chord.pianoKeys.slice(0, i).map((k) => k + 12));

    const inversionName = `${chord.name}/${rotatedNotes[0]}`;
    const inversionFullName = `${chord.fullName} ${ordinal(i)} Inversion`;

    inversions.push({
      ...chord,
      name: inversionName,
      fullName: inversionFullName,
      notes: rotatedNotes,
      pianoKeys: rotatedKeys,
    });
  }

  return inversions;
}

// helper: ordinal number (1st, 2nd, 3rd…)
function ordinal(n: number): string {
  return n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;
}
