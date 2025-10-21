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
                      ? "outline-blue-500"
                      : "outline-teal-500"
                  }`}
                  style={{ transform: "translate(0, -50%)" }}
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

// export const PianoKeys: React.FC<PianoKeysProps> = ({
//   annotations = [],
//   octaves = 3,
//   viewMode = "none",
//   onViewModeChange,
// }) => {
//   const notes = useNotes();
//   const { setNotesToPlay, playNotes, activeKeys } = useAudio();

//   // Expand keys across N octaves
//   const keys = useMemo(() => {
//     const startingOctave = 2; // first octave starts at A2
//     return Array.from({ length: octaves }, (_, octave) =>
//       notes.map((k, i) => {
//         const keyIndex = i + octave * 12;
//         const octaveNum = startingOctave + octave;

//         return {
//           ...k,
//           keyIndex,
//           octave: octaveNum,
//         };
//       })
//     ).flat();
//   }, [notes, octaves]);

//   const handlePlayNote = (key: NoteSpec) => {
//     playNotes([key], "chord");
//   };

//   useEffect(() => {
//     if (!annotations.length) return;

//     const notesToPlay = annotations
//       .map((a) => {
//         const key = keys.find((k) => k.keyIndex === a.keyIndex);
//         if (!key) return null;
//         return {
//           note: key.audioNote,
//           octave: key.octave,
//           keyIndex: key.keyIndex,
//         };
//       })
//       .filter(Boolean) as NoteSpec[];

//     setNotesToPlay((prev) => {
//       const isEqual =
//         prev.length === notesToPlay.length &&
//         prev.every(
//           (n, i) =>
//             n.note === notesToPlay[i].note && n.octave === notesToPlay[i].octave
//         );
//       return isEqual ? prev : notesToPlay;
//     });
//   }, [annotations, keys, setNotesToPlay]);

//   return (
//     <div
//       className="relative flex cursor-pointer py-4"
//       data-testid="piano-keys"
//       onClick={onViewModeChange}
//     >
//       {keys.map((key) => {
//         const keyAnnotations = annotations.filter(
//           (a) => a.keyIndex === key.keyIndex
//         );

//         // Background color based on annotations
//         let keyClass = "";
//         if (keyAnnotations.some((a) => a.label.startsWith("LH"))) {
//           keyClass = "bg-blue-500";
//         } else if (keyAnnotations.some((a) => a.label.startsWith("RH"))) {
//           keyClass = "bg-teal-500";
//         }

//         if (activeKeys.has(key.keyIndex)) {
//           keyClass = "bg-blue-300";
//         }

//         // Outline for black keys with annotations
//         if (
//           key.type === "black" &&
//           (keyAnnotations.length > 0 || activeKeys.has(key.keyIndex))
//         ) {
//           keyClass += " outline outline-black";
//         }

//         let noteClass = "";
//         if (
//           keyAnnotations.some(
//             (a) => a.label.startsWith("LH") || a.label.startsWith("RH")
//           )
//         ) {
//           noteClass = "text-black";
//         } else {
//           noteClass = "text-gray-400";
//         }

//         return (
//           <div
//             key={key.keyIndex}
//             className={`
//               relative flex flex-col items-center
//               ${key.type === "white" ? "white-key" : "black-key"}
//               ${(key.note === "B" || key.note === "E") && `mr-[-1px]`}
//               ${keyClass}
//             `}
//             title={key.note}
//             onClick={() =>
//               handlePlayNote({
//                 note: key.audioNote,
//                 octave: key.octave,
//                 keyIndex: key.keyIndex,
//               })
//             }
//           >
//             {/* Top notes (for black keys) */}
//             {(viewMode === "notes" || viewMode === "all") &&
//               key.type === "black" && (
//                 <span
//                   className={`absolute -top-5 text-xs font-bold ${noteClass}`}
//                 >
//                   {key.note}
//                 </span>
//               )}

//             {/* Overlay annotations */}
//             {(viewMode === "annotations" || viewMode === "all") &&
//               keyAnnotations.map((ann, idx) => (
//                 <div
//                   key={idx}
//                   className={`absolute top-[50%] text-xs font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center outline-2 z-20 ${
//                     ann.label.startsWith("LH")
//                       ? "outline-blue-500"
//                       : "outline-teal-500"
//                   }`}
//                   style={{
//                     transform: "translate(0, -50%)",
//                   }}
//                 >
//                   <span
//                     className={`${
//                       ann.label.startsWith("LH")
//                         ? "text-blue-500"
//                         : "text-teal-500"
//                     }`}
//                   >
//                     {ann.label.slice(3)}
//                   </span>
//                 </div>
//               ))}

//             {/* Bottom notes (for white keys) */}
//             {(viewMode === "notes" || viewMode === "all") &&
//               key.type === "white" && (
//                 <span
//                   className={`absolute -bottom-5 text-xs font-bold ${noteClass}`}
//                 >
//                   {key.note}
//                 </span>
//               )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };
