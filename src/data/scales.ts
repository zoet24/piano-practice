import { NOTES } from "./notes";

export interface Scale {
  name: string;
  fullName: string;
  intervals: number[];
  pianoKeys: number[];
}

export const SCALE_TYPES: Record<string, string> = {
  major: "Major",
  minor: "Minor",
  dorian: "Dorian",
  mixolydian: "Mixolydian",
  pentatonic: "Pentatonic",
  blues: "Blues",
};

// intervals relative to the root, in semitones
const SCALE_FORMULAS: Record<
  string,
  { fullName: string; intervals: number[] }
> = {
  major: {
    fullName: "Major Scale",
    intervals: [0, 2, 4, 5, 7, 9, 11],
  },
  minor: {
    fullName: "Natural Minor Scale",
    intervals: [0, 2, 3, 5, 7, 8, 10],
  },
  dorian: {
    fullName: "Dorian Mode",
    intervals: [0, 2, 3, 5, 7, 9, 10],
  },
  mixolydian: {
    fullName: "Mixolydian Mode",
    intervals: [0, 2, 4, 5, 7, 9, 10],
  },
  pentatonic: {
    fullName: "Pentatonic Scale",
    intervals: [0, 2, 4, 7, 9],
  },
  blues: {
    fullName: "Blues Scale",
    intervals: [0, 3, 5, 6, 7, 10],
  },
};

const generateAllScales = (): Record<string, Scale> => {
  const scales: Record<string, Scale> = {};

  NOTES.forEach((note, rootIndex) => {
    for (const [type, { fullName, intervals }] of Object.entries(
      SCALE_FORMULAS
    )) {
      const name = `${note.noteSharp}-${type}`;
      const fullScaleName = `${note.noteSharp} ${fullName}`;

      // Map each interval to the correct key index
      const pianoKeys = intervals.map((i) => (rootIndex + i) % 12);

      scales[name] = {
        name,
        fullName: fullScaleName,
        intervals,
        pianoKeys,
      };
    }
  });

  return scales;
};

export const SCALES: Record<string, Scale> = generateAllScales();
