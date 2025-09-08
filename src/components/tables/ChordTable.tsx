import { Button } from "@/components/ui/button";
import { CHORD_NOTES, CHORD_TYPES, CHORDS } from "@/data/chords";
import { generateInversions } from "../../hooks/generateInversions";

interface ChordTableProps {
  isTestMode: boolean;
  //   selectedItems: Set<string>;
  onChordClick: (chordId: string) => void;
  //   onToggleSelection: (chordId: string) => void;
}

export function ChordTable({
  isTestMode,
  //   selectedItems,
  onChordClick,
}: //   onToggleSelection,
ChordTableProps) {
  const handleCellClick = (chordId: string) => {
    if (isTestMode) {
      //   onToggleSelection(chordId);
    } else {
      onChordClick(chordId);
    }
  };

  const getChordId = (note: string, type: string): string => {
    const cleanNote = note.split("/")[0]; // Use first part for sharp/flat notes
    switch (type) {
      case "major":
        return cleanNote;
      case "minor":
        return `${cleanNote}m`;
      case "7th":
        return `${cleanNote}7`;
      case "maj7":
        return `${cleanNote}maj7`;
      case "min7":
        return `${cleanNote}m7`;
      case "dim":
        return `${cleanNote}dim`;
      case "aug":
        return `${cleanNote}aug`;
      default:
        return cleanNote;
    }
  };

  const typeLabels = {
    major: "Major",
    minor: "Minor",
    "7th": "7th",
    maj7: "Maj7",
    min7: "Min7",
    dim: "Dim",
    aug: "Aug",
  };

  console.log(CHORDS.C);
  console.log(generateInversions(CHORDS.C));

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Note
              </th>
              {CHORD_TYPES.map((type) => (
                <th
                  key={type}
                  className="px-4 py-3 text-center text-sm font-medium text-muted-foreground"
                >
                  {typeLabels[type as keyof typeof typeLabels]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {CHORD_NOTES.map((note) => (
              <tr key={note}>
                <td className="px-4 py-3 font-semibold text-foreground">
                  {note}
                </td>
                {CHORD_TYPES.map((type) => {
                  const chordId = getChordId(note, type);
                  const chord = CHORDS[chordId];
                  //   const isSelected = selectedItems.has(chordId);

                  if (!chord) {
                    return (
                      <td key={type} className="px-2 py-2">
                        <div className="w-full px-3 py-2 text-sm text-muted-foreground text-center">
                          —
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={type} className="px-2 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCellClick(chordId)}
                        // className={`
                        //   chord-cell w-full px-3 py-2 text-sm transition-all duration-200
                        //   ${
                        //     isSelected && isTestMode
                        //       ? "selected-for-test text-white border-transparent"
                        //       : "bg-card hover:bg-muted"
                        //   }
                        // `}
                        className={`
                          chord-cell w-full px-3 py-2 text-sm transition-all duration-200
                        `}
                        data-testid={`chord-${chordId}`}
                      >
                        {chord.name}
                      </Button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
