import { useNotes } from "../../data/notes";
import type { KeyAnnotation, ViewMode } from "../modals/ChordModal";

interface PianoKeysProps {
  annotations?: KeyAnnotation[];
  octaves?: number;
  viewMode?: ViewMode;
  onViewModeChange?: () => void;
}

export const PianoKeys: React.FC<PianoKeysProps> = ({
  annotations = [],
  octaves = 2,
  viewMode = "none",
  onViewModeChange,
}) => {
  const notes = useNotes();

  // Expand keys across N octaves
  const keys = Array.from({ length: octaves }, (_, octave) =>
    notes.map((k, i) => ({
      ...k,
      keyIndex: i + octave * 12,
    }))
  ).flat();

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
          keyClass = "bg-red-500";
        }

        // Outline for black keys with annotations
        if (key.type === "black" && keyAnnotations.length > 0) {
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
                  className="absolute top-[50%] text-xs font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center outline-2 z-20"
                  style={{
                    transform: "translate(0, -50%)",
                    outlineColor: ann.label.startsWith("LH")
                      ? "#3b82f6"
                      : "#ef4444",
                  }}
                >
                  <span
                    style={{
                      color: ann.label.startsWith("LH") ? "#3b82f6" : "#ef4444",
                    }}
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
