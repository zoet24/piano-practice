import { NOTES } from "./notes";

export interface Chord {
  name: string;
  fullName: string;
  leftHand: number[];
  rightHand: number[];
  pianoKeys: number[];
}

export const CHORD_TYPES: Record<string, string> = {
  major: "Major",
  minor: "Minor",
  "7th": "7th",
  maj7: "Maj7",
  min7: "Min7",
  dim: "Dim",
  aug: "Aug",
};

const CHORD_FORMULAS: Record<
  string,
  { fullName: string; intervals: number[] }
> = {
  major: { fullName: "Major", intervals: [0, 4, 7] },
  minor: { fullName: "Minor", intervals: [0, 3, 7] },
  "7": { fullName: "Dominant 7th", intervals: [0, 4, 7, 10] },
  maj7: { fullName: "Major 7th", intervals: [0, 4, 7, 11] },
  min7: { fullName: "Minor 7th", intervals: [0, 3, 7, 10] },
  dim: { fullName: "Diminished", intervals: [0, 3, 6] },
  aug: { fullName: "Augmented", intervals: [0, 4, 8] },
};

const generateAllChords = (): Record<string, Chord> => {
  const chords: Record<string, Chord> = {};

  NOTES.forEach((note, rootIndex) => {
    for (const [type, { fullName, intervals }] of Object.entries(
      CHORD_FORMULAS
    )) {
      // internal name (always sharp-based, stable ID)
      const name =
        type === "major"
          ? note.noteSharp
          : note.noteSharp + (type === "minor" ? "m" : type);

      const fullChordName =
        note.noteSharp + " " + (type === "major" ? "Major" : fullName);

      // generate piano keys in ascending order from root
      const pianoKeys = intervals
        .map((i) => (rootIndex + i) % 12)
        .sort(
          (a, b) => ((a - rootIndex + 12) % 12) - ((b - rootIndex + 12) % 12)
        );

      // left hand: root at bottom, ascending
      const leftHand = pianoKeys
        .slice(0, 5)
        .map((_, i) => i + 1)
        .reverse();

      // right hand: root at bottom, ascending
      const rightHand = pianoKeys.map((_, i) => i + 1);

      chords[name] = {
        name,
        fullName: fullChordName,
        leftHand,
        rightHand,
        pianoKeys,
      };
    }
  });

  return chords;
};

export const CHORDS: Record<string, Chord> = generateAllChords();
