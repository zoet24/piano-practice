import { useCallback } from "react";
import { useNoteLabel, useNotes } from "../../data/notes";
import { resolvePracticeItem } from "../../data/practiceItems";
import {
  mapChordKeysToAnnotations,
  mapScaleKeysToAnnotations,
} from "../../hooks/mapKeysToAnnotations";
import type { Hand } from "../../lib/practiceDeck";
import { createHandOptions } from "../modals/useModel";

export const HAND_LABELS: Record<Hand, string> = {
  left: "Left hand",
  both: "Both hands",
  right: "Right hand",
};

// everything needed to show or play a practice item, in the current sharp/flat naming
export const usePracticeItemDisplay = () => {
  const notes = useNotes();
  const getNoteLabel = useNoteLabel();

  return useCallback(
    (itemId: string, hand: Hand = "both") => {
      const resolved = resolvePracticeItem(itemId, notes);
      if (!resolved) return null;

      const { lhAnnotations, rhAnnotations } =
        resolved.kind === "chord"
          ? mapChordKeysToAnnotations(resolved.data)
          : mapScaleKeysToAnnotations(resolved.data);

      const annotations =
        createHandOptions(lhAnnotations, rhAnnotations)
          .find((option) => option.key === hand)
          ?.getAnnotations() ?? [];

      return {
        itemId,
        kind: resolved.kind,
        title: getNoteLabel(resolved.data.fullName),
        shortLabel:
          resolved.kind === "chord"
            ? getNoteLabel(resolved.data.name)
            : getNoteLabel(resolved.data.fullName),
        noteNames: resolved.data.pianoKeys.map((k) => notes[k % 12].note),
        annotations,
      };
    },
    [notes, getNoteLabel]
  );
};

export type PracticeItemDisplay = NonNullable<
  ReturnType<ReturnType<typeof usePracticeItemDisplay>>
>;
