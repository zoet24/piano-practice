import { Badge } from "../../ui/badge";
import { DialogHeader, DialogTitle } from "../../ui/dialog";

interface MusicHeaderProps {
  title: string;
  notes: string[];
}

export const MusicHeader = ({ title, notes }: MusicHeaderProps) => (
  <DialogHeader>
    <div className="flex flex-col items-center gap-2">
      <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
      <div className="flex gap-2 flex-wrap justify-center">
        {notes.map((note, i) => (
          <Badge
            key={i}
            variant="default"
            className="px-3 py-1 text-sm font-medium"
          >
            {note}
          </Badge>
        ))}
      </div>
    </div>
  </DialogHeader>
);
