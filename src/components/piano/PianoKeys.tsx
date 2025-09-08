import type { KeyAnnotation } from "../modals/ChordModal";

interface PianoKeysProps {
  activeKeys: number[];
  annotations?: KeyAnnotation[];
  octaves?: number;
}

export function PianoKeys({
  activeKeys,
  annotations = [],
  octaves = 2,
}: PianoKeysProps) {
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

  const rightHandKeys = activeKeys.map((k) => k + 12);
  const allActiveKeys = [...activeKeys, ...rightHandKeys];

  return (
    <div className="relative flex" data-testid="piano-keys">
      {keys.map((key) => {
        const isActive = allActiveKeys.includes(key.keyIndex);
        const keyAnnotations = annotations.filter(
          (a) => a.keyIndex === key.keyIndex
        );

        return (
          <div
            key={key.keyIndex}
            className={`
              relative flex items-end justify-center
              ${key.type === "white" ? "white-key" : "black-key"}
              ${isActive ? "key-active" : ""}
            `}
            title={key.note}
          >
            {/* Overlay annotations */}
            {keyAnnotations.map((ann, idx) => (
              <span
                key={idx}
                className={`
                  absolute text-xs font-bold rounded px-1
                  ${
                    ann.label.startsWith("LH")
                      ? "bg-blue-500 text-white"
                      : "bg-red-500 text-white"
                  }
                `}
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
