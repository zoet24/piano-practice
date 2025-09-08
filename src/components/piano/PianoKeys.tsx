import type { KeyAnnotation } from "../modals/ChordModal";

interface PianoKeysProps {
  annotations?: KeyAnnotation[];
  octaves?: number;
}

export function PianoKeys({ annotations = [], octaves = 2 }: PianoKeysProps) {
  const baseKeys = [
    { type: "white", note: "C" },
    { type: "black", note: "C#" },
    { type: "white", note: "D" },
    { type: "black", note: "D#" },
    { type: "white", note: "E" },
    { type: "white", note: "F" },
    { type: "black", note: "F#" },
    { type: "white", note: "G" },
    { type: "black", note: "G#" },
    { type: "white", note: "A" },
    { type: "black", note: "A#" },
    { type: "white", note: "B" },
  ];

  // Expand across N octaves
  const keys = Array.from({ length: octaves }, (_, octave) =>
    baseKeys.map((k, i) => ({
      ...k,
      keyIndex: i + octave * 12,
      note: `${k.note}${octave}`,
    }))
  ).flat();

  return (
    <div className="relative flex" data-testid="piano-keys">
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
                relative flex items-end justify-center
                ${key.type === "white" ? "white-key" : "black-key"}
                ${bgClass}
              `}
            title={key.note}
          >
            {/* Overlay annotations */}
            {keyAnnotations.map((ann, idx) => (
              <span
                key={idx}
                className="absolute text-xs font-bold rounded px-1 text-white"
                style={{
                  top: ann.label.startsWith("LH") ? "10%" : "60%",
                }}
              >
                {ann.label}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
