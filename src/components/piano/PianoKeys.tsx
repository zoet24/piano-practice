import { useState } from "react";
import { CHORD_NOTES } from "../../data/chords";
import type { KeyAnnotation } from "../modals/ChordModal";

interface PianoKeysProps {
  annotations?: KeyAnnotation[];
  octaves?: number;
}

type ViewMode = "none" | "annotations" | "notes-sharp" | "notes-flat";

export function PianoKeys({ annotations = [], octaves = 2 }: PianoKeysProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("none");

  // Expand across N octaves
  const keys = Array.from({ length: octaves }, (_, octave) =>
    CHORD_NOTES.map((k, i) => ({
      ...k,
      keyIndex: i + octave * 12,
      noteSharp: `${k.noteSharp}`,
      noteFlat: `${k.noteFlat}`,
    }))
  ).flat();

  const handleClick = () => {
    const modes: ViewMode[] = [
      "none",
      "annotations",
      "notes-sharp",
      "notes-flat",
    ];
    const nextIndex = (modes.indexOf(viewMode) + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  };

  return (
    <div
      className="relative flex cursor-pointer"
      data-testid="piano-keys"
      onClick={handleClick}
    >
      {keys.map((key) => {
        const keyAnnotations = annotations.filter(
          (a) => a.keyIndex === key.keyIndex
        );

        // Determine background color based on annotations
        let bgClass = "";
        if (keyAnnotations.some((a) => a.label.startsWith("LH"))) {
          bgClass = "bg-blue-500";
        } else if (keyAnnotations.some((a) => a.label.startsWith("RH"))) {
          bgClass = "bg-red-500";
        }

        return (
          <div
            key={key.keyIndex}
            className={`
                relative flex flex-col items-center
                ${key.type === "white" ? "white-key" : "black-key"}
                ${
                  (key.noteSharp === "B" || key.noteSharp === "E") &&
                  `mr-[-1px]`
                }
                ${bgClass}
              `}
            title={key.noteSharp}
          >
            {/* Top notes */}
            {(viewMode === "notes-sharp" || viewMode === "notes-flat") &&
              key.type === "black" && (
                <span className="absolute -top-5 text-xs font-bold text-black">
                  {viewMode === "notes-sharp" ? key.noteSharp : key.noteFlat}
                </span>
              )}

            {/* Overlay annotations */}
            {(viewMode === "annotations" ||
              viewMode === "notes-sharp" ||
              viewMode === "notes-flat") &&
              keyAnnotations.map((ann, idx) => (
                <span
                  key={idx}
                  className={`absolute text-xs font-bold rounded px-1 text-white`}
                  style={{
                    backgroundColor: ann.label.startsWith("LH")
                      ? "#3b82f6"
                      : "#ef4444",
                  }}
                >
                  {ann.label}
                </span>
              ))}

            {/* Bottom notes */}
            {(viewMode === "notes-sharp" || viewMode === "notes-flat") &&
              key.type === "white" && (
                <span className="absolute -bottom-5 text-xs font-bold text-black">
                  {viewMode === "notes-sharp" ? key.noteSharp : key.noteFlat}
                </span>
              )}
          </div>
        );
      })}
    </div>
  );
}
