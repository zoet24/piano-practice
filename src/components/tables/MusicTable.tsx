import { Button } from "@/components/ui/button";
import { useMusicTableModel } from "./useModel";

interface MusicTableProps {
  isTestMode: boolean;
  onItemClick: (itemId: string) => void;
}

export const MusicTable = ({ isTestMode, onItemClick }: MusicTableProps) => {
  const { types, notes, getCellData, handleItemClick } = useMusicTableModel(
    isTestMode,
    onItemClick
  );

  return (
    <div className="w-full overflow-x-auto rounded-md border border-border shadow snap-x">
      <table className="min-w-[600px] w-full text-center table-fixed bg-white">
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="py-3 text-sm font-medium text-muted-foreground sticky top-0 left-0 bg-muted border-r border-border z-20 w-[80px]">
              Note
            </th>
            {Object.entries(types).map(([type, label]) => (
              <th
                key={type}
                className="py-3 text-sm font-medium text-muted-foreground sticky top-0 bg-muted z-10 w-[100px]"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {notes.map((noteObj, idx) => (
            <tr key={idx}>
              <td className="py-3 font-semibold text-foreground sticky left-0 bg-background flex justify-center border-r border-border z-10">
                {noteObj.note}
              </td>

              {Object.entries(types).map(([type]) => {
                const { id, label, exists } = getCellData(noteObj.note, type);

                return (
                  <td key={type} className="px-1 py-2">
                    {exists ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleItemClick(id)}
                        className="w-full px-3 py-2 text-sm transition-all duration-200"
                      >
                        {label}
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
