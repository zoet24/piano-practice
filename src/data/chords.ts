export interface Chord {
  name: string;
  fullName: string;
  leftHand: number[];
  rightHand: number[];
  pianoKeys: number[]; // Positions starting at 0 for C. Wraps every 12 semitones (mod 12).
}

export const CHORD_TYPES = ["major", "minor", "7th", "maj7", "min7"];

export const CHORD_NOTES = [
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
];

export const CHORDS: Record<string, Chord> = {
  C: {
    name: "C",
    fullName: "C Major",
    leftHand: [5, 3, 1],
    rightHand: [1, 3, 5],
    pianoKeys: [0, 4, 7],
  },
  Cm: {
    name: "Cm",
    fullName: "C Minor",
    leftHand: [5, 3, 1],
    rightHand: [1, 3, 5],
    pianoKeys: [0, 3, 7],
  },
  C7: {
    name: "C7",
    fullName: "C Dominant 7th",
    leftHand: [5, 3, 2, 1],
    rightHand: [1, 2, 3, 5],
    pianoKeys: [0, 4, 7, 10],
  },
  // ...
};

export function getChordNotes(
  chord: Chord,
  mode: "notes-sharp" | "notes-flat"
): string[] {
  return chord.pianoKeys.map((keyIndex) => {
    const key = CHORD_NOTES[keyIndex % 12]; // wrap around a single octave
    return mode === "notes-sharp" ? key.noteSharp : key.noteFlat;
  });
}
