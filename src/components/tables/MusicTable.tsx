import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { ConfidenceIndicator } from "../practice/ConfidenceIndicator";
import { CONFIDENCE_CELL_COLOURS } from "../practice/confidenceStyles";
import { useMusicTableModel, type TableSelection } from "./useModel";

interface MusicTableProps {
  onItemClick?: (itemId: string) => void;
  // when set, clicking cells (or row/column headers) selects items instead of opening them
  selection?: TableSelection;
  className?: string;
}

export const MusicTable = ({
  onItemClick = () => {},
  selection,
  className,
}: MusicTableProps) => {
  const {
    types,
    notes,
    getCellData,
    handleItemClick,
    handleColumnClick,
    handleRowClick,
    isSelecting,
  } = useMusicTableModel(onItemClick, selection);

  const headerButtonClass =
    "w-full rounded-md py-1 hover:bg-background hover:text-foreground cursor-pointer";

  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-md border border-border shadow snap-x",
        className
      )}
    >
      <table className="min-w-[600px] w-full text-center table-fixed bg-white">
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="py-3 text-sm font-medium text-muted-foreground sticky top-0 left-0 bg-muted border-r border-border z-20 w-[80px]">
              Note
            </th>
            {Object.entries(types).map(([type, label]) => (
              <th
                key={type}
                className="py-3 px-1 text-sm font-medium text-muted-foreground sticky top-0 bg-muted z-10 w-[100px]"
              >
                {isSelecting ? (
                  <button
                    type="button"
                    className={headerButtonClass}
                    onClick={() => handleColumnClick(type)}
                    title={`Select all ${label}`}
                  >
                    {label}
                  </button>
                ) : (
                  label
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {notes.map((noteObj, idx) => (
            <tr key={idx}>
              <td className="py-2 px-1 font-semibold text-foreground sticky left-0 bg-background flex justify-center border-r border-border z-10">
                {isSelecting ? (
                  <button
                    type="button"
                    className={headerButtonClass}
                    onClick={() => handleRowClick(noteObj.note)}
                    title={`Select all ${noteObj.note}`}
                  >
                    {noteObj.note}
                  </button>
                ) : (
                  noteObj.note
                )}
              </td>

              {Object.entries(types).map(([type]) => {
                const { id, practiceId, label, exists, confidence, isSelected } =
                  getCellData(noteObj.note, type);

                return (
                  <td key={type} className="px-1 py-1">
                    {exists ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleItemClick(id, practiceId)}
                        aria-pressed={isSelecting ? isSelected : undefined}
                        className={cn(
                          "relative h-9 w-full flex-col gap-0.5 px-3 py-0 text-sm leading-none transition-all duration-200",
                          CONFIDENCE_CELL_COLOURS[confidence],
                          isSelected &&
                            "bg-keys-left text-white border-keys-left hover:bg-keys-left/90 hover:text-white"
                        )}
                      >
                        {isSelected && (
                          <Check className="absolute left-1 top-1/2 -translate-y-1/2 size-3!" />
                        )}
                        {label}
                        <ConfidenceIndicator confidence={confidence} />
                      </Button>
                    ) : (
                      <div className="w-full px-3 py-2 text-sm text-muted-foreground text-center">
                        {label}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
