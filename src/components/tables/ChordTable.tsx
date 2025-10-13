import { Button } from "@/components/ui/button";
import { CHORD_TYPES, CHORDS } from "@/data/chords";
import { NOTES, useNoteLabel, useNotes } from "../../data/notes";

interface ChordTableProps {
  isTestMode: boolean;
  onChordClick: (chordId: string) => void;
}

export const ChordTable = ({ isTestMode, onChordClick }: ChordTableProps) => {
  const notes = useNotes();
  const getNoteLabel = useNoteLabel();

  const handleCellClick = (chordId: string) => {
    if (!isTestMode) {
      onChordClick(chordId);
    }
  };

  const getChordId = (note: string, type: string): string => {
    const noteEntry = NOTES.find(
      (n) => n.noteSharp === note || n.noteFlat === note
    );
    const root = noteEntry?.noteSharp ?? note;

    switch (type) {
      case "major":
        return root;
      case "minor":
        return `${root}m`;
      case "7th":
        return `${root}7`;
      case "maj7":
        return `${root}maj7`;
      case "min7":
        return `${root}min7`;
      case "dim":
        return `${root}dim`;
      case "aug":
        return `${root}aug`;
      default:
        return root;
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-md border border-border shadow snap-x">
      <table className="min-w-[600px] w-full text-center table-fixed">
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="py-3 text-sm font-medium text-muted-foreground first:border-r first:border-border sticky top-0 left-0 bg-muted z-20 flex justify-center">
              Note
            </th>
            {Object.entries(CHORD_TYPES).map(([type, label]) => (
              <th
                key={type}
                className="py-3 text-sm font-medium text-muted-foreground sticky top-0 bg-muted z-10"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {notes.map((noteObj, idx) => {
            const noteLabel = noteObj.note;

            return (
              <tr key={idx}>
                <td className="py-3 font-semibold text-foreground sticky left-0 bg-background border-r border-border z-10 flex justify-center">
                  {noteLabel}
                </td>
                {Object.entries(CHORD_TYPES).map(([type]) => {
                  const chordId = getChordId(noteLabel, type);
                  const chord = CHORDS[chordId];

                  if (!chord) {
                    return (
                      <td key={type} className="px-1 py-2">
                        <div className="w-full px-3 py-2 text-sm text-muted-foreground text-center">
                          —
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={type} className="px-1 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCellClick(chordId)}
                        className="chord-cell w-full px-3 py-2 text-sm transition-all duration-200"
                        data-testid={`chord-${chordId}`}
                      >
                        {getNoteLabel(chord.name)}
                      </Button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
