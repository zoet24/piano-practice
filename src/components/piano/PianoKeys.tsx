import { Volume2 } from "lucide-react";
import { useState } from "react";
import { useNotes } from "../../data/notes";
import type { KeyAnnotation, ViewMode } from "../modals/useModel";
import { Button } from "../ui/button";

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
  type = "scale",
}) => {
  const notes = useNotes();
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());

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

  const handlePlayNote = (
    keyIndex: number,
    audioNote: string,
    octave: number
  ) => {
    const audio = new Audio(`/audio/piano/${audioNote}${octave}.mp3`);

    setActiveKeys((prev) => new Set(prev).add(keyIndex));

    audio.currentTime = 0;
    audio.play().catch((err) => console.warn("Audio play failed:", err));

    audio.addEventListener("ended", () => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(keyIndex);
        return next;
      });
    });
  };

  const handlePlayNotes = () => {
    if (!annotations.length) return;

    // Map annotation keyIndexes to key data (note name + octave)
    const notesToPlay = annotations
      .map((a) => {
        const key = keys.find((k) => k.keyIndex === a.keyIndex);
        if (!key) return null;
        return {
          keyIndex: key.keyIndex,
          audioNote: key.audioNote,
          octave: key.octave,
        };
      })
      .filter(
        (n): n is { keyIndex: number; audioNote: string; octave: number } =>
          n !== null
      );

    if (type === "scale") {
      // 🎵 Sequential playback
      notesToPlay.forEach((n, i) => {
        setTimeout(() => {
          handlePlayNote(n.keyIndex, n.audioNote, n.octave);
        }, i * 250); // 250ms gap between notes (adjust tempo)
      });
    } else {
      // 🎶 Chord playback — all notes together
      notesToPlay.forEach((n) => {
        handlePlayNote(n.keyIndex, n.audioNote, n.octave);
      });
    }
  };

  console.log(annotations);

  return (
    <div
      className="relative flex cursor-pointer py-4"
      data-testid="piano-keys"
      onClick={onViewModeChange}
    >
      <Button
        size="icon"
        variant="ghost"
        onClick={handlePlayNotes}
        aria-label="Play chord"
      >
        <Volume2 className="h-5 w-5" />
      </Button>
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
            onClick={() =>
              handlePlayNote(key.keyIndex, key.audioNote, key.octave)
            }
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
