import type { KeyAnnotation, ViewMode } from "../modals/useModel";
import { usePianoKeys } from "./useModel";

interface PianoKeysProps {
  annotations?: KeyAnnotation[];
  octaves?: number;
  viewMode?: ViewMode;
  onViewModeChange?: () => void;
  type?: "chord" | "scale";
}

export const PianoKeys: React.FC<PianoKeysProps> = ({
  annotations = [],
  octaves = 3,
  viewMode = "none",
  onViewModeChange,
}) => {
  const { keys, handlePlayNote, getKeyClasses } = usePianoKeys({
    annotations,
    octaves,
  });

  return (
    <div
      className="relative flex cursor-pointer py-4"
      data-testid="piano-keys"
      onClick={onViewModeChange}
    >
      {keys.map((key) => {
        const { keyClass, noteClass, keyAnnotations } = getKeyClasses(
          key.keyIndex!,
          key.type,
          annotations
        );

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
            onClick={() =>
              handlePlayNote({
                note: key.audioNote,
                octave: key.octave,
                keyIndex: key.keyIndex,
              })
            }
          >
            {(viewMode === "notes" || viewMode === "all") &&
              key.type === "black" && (
                <span
                  className={`absolute -top-5 text-xs font-bold ${noteClass}`}
                >
                  {key.note}
                </span>
              )}

            {(viewMode === "annotations" || viewMode === "all") &&
              keyAnnotations.map((ann, idx) => (
                <div
                  key={idx}
                  className={`absolute top-[50%] text-xs font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center outline-2 z-20 ${
                    ann.label.startsWith("LH")
                      ? "outline-keys-left"
                      : "outline-keys-right"
                  }`}
                  style={{ transform: "translate(0, -50%)" }}
                >
                  <span
                    className={`${
                      ann.label.startsWith("LH")
                        ? "text-keys-left"
                        : "text-keys-right"
                    }`}
                  >
                    {ann.label.slice(3)}
                  </span>
                </div>
              ))}

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
