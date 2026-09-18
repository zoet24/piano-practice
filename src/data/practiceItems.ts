import { generateInversions } from "../hooks/generateInversions";
import { CHORD_TYPES, CHORDS, getChordId, type Chord } from "./chords";
import { NOTES, type Note } from "./notes";
import { SCALE_TYPES, SCALES, type Scale } from "./scales";

export type PracticeKind = "chord" | "scale";

export interface PracticeItem {
  // stable storage key, e.g. "chord:C#m", "chord:C#m/inv1", "scale:C#-major"
  id: string;
  kind: PracticeKind;
  // id of the root-position chord or the scale, as shown in the table
  baseId: string;
  // key into CHORDS / SCALES
  dataKey: string;
  type: string;
  rootIndex: number;
  inversion: number;
}

export const getChordPracticeId = (chordName: string, inversion = 0) =>
  inversion === 0 ? `chord:${chordName}` : `chord:${chordName}/inv${inversion}`;

export const getScalePracticeId = (scaleName: string) => `scale:${scaleName}`;

const buildItems = (): PracticeItem[] => {
  const items: PracticeItem[] = [];

  NOTES.forEach((note, rootIndex) => {
    Object.keys(CHORD_TYPES).forEach((type) => {
      const dataKey = getChordId(note.noteSharp, type);
      const chord = CHORDS[dataKey];
      if (!chord) return;
      const baseId = getChordPracticeId(dataKey);

      chord.pianoKeys.forEach((_, inversion) => {
        items.push({
          id: getChordPracticeId(dataKey, inversion),
          kind: "chord",
          baseId,
          dataKey,
          type,
          rootIndex,
          inversion,
        });
      });
    });
  });

  NOTES.forEach((note, rootIndex) => {
    Object.keys(SCALE_TYPES).forEach((type) => {
      const dataKey = `${note.noteSharp}-${type}`;
      if (!SCALES[dataKey]) return;
      const id = getScalePracticeId(dataKey);

      items.push({
        id,
        kind: "scale",
        baseId: id,
        dataKey,
        type,
        rootIndex,
        inversion: 0,
      });
    });
  });

  return items;
};

export const ALL_PRACTICE_ITEMS: PracticeItem[] = buildItems();

export const PRACTICE_ITEMS_BY_ID: Map<string, PracticeItem> = new Map(
  ALL_PRACTICE_ITEMS.map((item) => [item.id, item])
);

export type ResolvedPracticeItem =
  | { item: PracticeItem; kind: "chord"; data: Chord }
  | { item: PracticeItem; kind: "scale"; data: Scale };

// looks up the chord (or inversion) / scale data behind a practice item
export const resolvePracticeItem = (
  id: string,
  notes: Note[]
): ResolvedPracticeItem | null => {
  const item = PRACTICE_ITEMS_BY_ID.get(id);
  if (!item) return null;

  if (item.kind === "scale") {
    return { item, kind: "scale", data: SCALES[item.dataKey] };
  }

  const chord = CHORDS[item.dataKey];
  const data =
    item.inversion === 0
      ? chord
      : generateInversions(chord, notes)[item.inversion - 1];

  return data ? { item, kind: "chord", data } : null;
};
