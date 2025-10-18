import type { KeyAnnotation } from "../components/modals/MusicModal";
import type { Chord } from "../data/chords";
import type { Scale } from "../data/scales";

export const mapChordKeysToAnnotations = (ch: Chord) => {
  const lhAnnotations: KeyAnnotation[] = [];
  const rhAnnotations: KeyAnnotation[] = [];

  let lastKey = -1;

  ch.pianoKeys.forEach((k, i) => {
    let keyIndex = k;
    if (keyIndex <= lastKey) keyIndex += 12;
    lastKey = keyIndex;

    lhAnnotations.push({
      keyIndex,
      label: `LH ${ch.leftHand?.[i] ?? ""}`,
    });

    rhAnnotations.push({
      keyIndex: keyIndex + 12, // RH one octave higher
      label: `RH ${ch.rightHand?.[i] ?? ""}`,
    });
  });

  return { lhAnnotations, rhAnnotations };
};

export const mapScaleKeysToAnnotations = (scale: Scale) => {
  const lhAnnotations: KeyAnnotation[] = [];
  const rhAnnotations: KeyAnnotation[] = [];

  let lastKey = -1;

  scale.pianoKeys.forEach((k, i) => {
    let keyIndex = k;
    if (keyIndex <= lastKey) keyIndex += 12; // ensure ascending
    lastKey = keyIndex;

    lhAnnotations.push({
      keyIndex,
      label: `LH-${scale.pianoKeys[i]}`, // or the note name if you want
    });

    rhAnnotations.push({
      keyIndex: keyIndex + 12, // RH one octave higher
      label: `RH-${scale.pianoKeys[i]}`, // or the note name
    });
  });

  return { lhAnnotations, rhAnnotations };
};
