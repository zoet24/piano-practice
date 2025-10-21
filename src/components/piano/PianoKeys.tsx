import { useAudio } from "../../contexts/AudioContext";
import { useNotes } from "../../data/notes";
import type { KeyAnnotation, ViewMode } from "../modals/useModel";

interface PianoKeysProps {
  annotations?: KeyAnnotation[];
  octaves?: number;
  viewMode?: ViewMode;
  onViewModeChange?: () => void;
}

export const PianoKeys: React.FC<PianoKeysProps> = ({
  annotations = [],
  octaves = 3,
  viewMode = "none",
  onViewModeChange,
}) => {
  const notes = useNotes();
  const { playKey, activeKeys } = useAudio();

  // Expand keys across N octaves
  const startingOctave = 2; // first octave starts at A2
  const keys = Array.from({ length: octaves }, (_, octave) =>
    notes.map((k, i) => {
      const keyIndex = i + octave * 12;
      const octaveNum = startingOctave + octave;

      return {
        ...k,
        keyIndex,
        octave: octaveNum,
      };
    })
  ).flat();

  const playNote = (keyIndex: number, note: string, octave: number) => {
    playKey({ note, octave, keyIndex });
  };

  return (
    <div
      className="relative flex cursor-pointer py-4"
      data-testid="piano-keys"
      onClick={onViewModeChange}
    >
      {keys.map((key) => {
        const keyAnnotations = annotations.filter(
          (a) => a.keyIndex === key.keyIndex
        );

        // Background color based on annotations
        let keyClass = "";
        if (keyAnnotations.some((a) => a.label.startsWith("LH"))) {
          keyClass = "bg-blue-500";
        } else if (keyAnnotations.some((a) => a.label.startsWith("RH"))) {
          keyClass = "bg-teal-500";
        }

        if (activeKeys.has(key.keyIndex)) {
          keyClass = "bg-blue-300";
        }

        // Outline for black keys with annotations
        if (
          key.type === "black" &&
          (keyAnnotations.length > 0 || activeKeys.has(key.keyIndex))
        ) {
          keyClass += " outline outline-black";
        }

        let noteClass = "";
        if (
          keyAnnotations.some(
            (a) => a.label.startsWith("LH") || a.label.startsWith("RH")
          )
        ) {
          noteClass = "text-black";
        } else {
          noteClass = "text-gray-400";
        }

        return (
          <div
            key={key.keyIndex}
            className={`
              relative flex flex-col items-center
              ${key.type === "white" ? "white-key" : "black-key"}
              ${(key.note === "B" || key.note === "E") && `mr-[-1px]`}
              ${keyClass}
            `}
            title={key.note}
            onClick={() => playNote(key.keyIndex, key.audio, key.octave)}
          >
            {/* Top notes (for black keys) */}
            {(viewMode === "notes" || viewMode === "all") &&
              key.type === "black" && (
                <span
                  className={`absolute -top-5 text-xs font-bold ${noteClass}`}
                >
                  {key.note}
                </span>
              )}

            {/* Overlay annotations */}
            {(viewMode === "annotations" || viewMode === "all") &&
              keyAnnotations.map((ann, idx) => (
                <div
                  key={idx}
                  className={`absolute top-[50%] text-xs font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center outline-2 z-20 ${
                    ann.label.startsWith("LH")
                      ? "outline-blue-500"
                      : "outline-teal-500"
                  }`}
                  style={{
                    transform: "translate(0, -50%)",
                  }}
                >
                  <span
                    className={`${
                      ann.label.startsWith("LH")
                        ? "text-blue-500"
                        : "text-teal-500"
                    }`}
                  >
                    {ann.label.slice(3)}
                  </span>
                </div>
              ))}

            {/* Bottom notes (for white keys) */}
            {(viewMode === "notes" || viewMode === "all") &&
              key.type === "white" && (
                <span
                  className={`absolute -bottom-5 text-xs font-bold ${noteClass}`}
                >
                  {key.note}
                </span>
              )}
          </div>
        );
      })}
    </div>
  );
};
