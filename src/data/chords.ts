export interface Chord {
  name: string;
  fullName: string;
  notes: string[];
  leftHand: number[];
  rightHand: number[];
  pianoKeys: number[]; // Piano key positions (0-11 representing C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
}

export const CHORD_NOTES = [
  "C",
  "C#/Db",
  "D",
  "D#/Eb",
  "E",
  "F",
  "F#/Gb",
  "G",
  "G#/Ab",
  "A",
  "A#/Bb",
  "B",
];
export const CHORD_TYPES = ["major", "minor", "7th", "maj7", "min7"];

export const CHORDS: Record<string, Chord> = {
  // C Chords
  C: {
    name: "C",
    fullName: "C Major",
    notes: ["C", "E", "G"],
    leftHand: [5, 3, 1],
    rightHand: [1, 3, 5],
    pianoKeys: [0, 4, 7],
  },
  Cm: {
    name: "Cm",
    fullName: "C Minor",
    notes: ["C", "Eb", "G"],
    leftHand: [5, 3, 1],
    rightHand: [1, 3, 5],
    pianoKeys: [0, 3, 7],
  },
  C7: {
    name: "C7",
    fullName: "C Dominant 7th",
    notes: ["C", "E", "G", "Bb"],
    leftHand: [5, 3, 2, 1],
    rightHand: [1, 2, 3, 5],
    pianoKeys: [0, 4, 7, 10],
  },
  Cmaj7: {
    name: "Cmaj7",
    fullName: "C Major 7th",
    notes: ["C", "E", "G", "B"],
    leftHand: [5, 2, 3, 1],
    rightHand: [1, 2, 3, 5],
    pianoKeys: [0, 4, 7, 11],
  },
  Cm7: {
    name: "Cm7",
    fullName: "C Minor 7th",
    notes: ["C", "Eb", "G", "Bb"],
    leftHand: [5, 2, 3, 1],
    rightHand: [1, 2, 3, 5],
    pianoKeys: [0, 3, 7, 10],
  },
  // ...more chords
};

export function getChordsByNote(note: string): Chord[] {
  return Object.values(CHORDS).filter((chord) =>
    chord.name.startsWith(note.replace("/", ""))
  );
}

export function getAllChords(): Chord[] {
  return Object.values(CHORDS);
}
