import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CHORDS, type Chord } from "@/data/chords";
import { PianoKeys } from "../piano/PianoKeys";

interface ChordModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  type: "chord" | "scale";
}

export function ChordModal({ isOpen, onClose, itemId, type }: ChordModalProps) {
  if (!itemId) return null;

  const item: Chord = CHORDS[itemId];

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="modal-chord-details"
      >
        <DialogHeader>
          <DialogTitle
            className="text-2xl font-bold"
            data-testid="text-chord-name"
          >
            {item.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 pt-4">
          <div>
            <h4 className="text-lg font-semibold mb-3 text-foreground">
              Notes
            </h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {item.notes.map((note, index) => (
                <Badge
                  key={index}
                  variant="default"
                  className="px-3 py-1 text-sm font-medium"
                  data-testid={`badge-note-${note}`}
                >
                  {note}
                </Badge>
              ))}
            </div>

            <h4 className="text-lg font-semibold mb-3 text-foreground">
              Piano Visualization
            </h4>
            <PianoKeys
              activeKeys={item.pianoKeys}
              data-testid="piano-visualization"
            />
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3 text-foreground">
              Hand Positions
            </h4>

            <div className="mb-4">
              <h5 className="font-medium text-muted-foreground mb-2">
                Left Hand
              </h5>
              <div
                className="bg-muted p-3 rounded-lg text-sm text-foreground"
                data-testid="text-left-hand"
              >
                {item.leftHand.map((position, index) => (
                  <div key={index}>{position}</div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-muted-foreground mb-2">
                Right Hand
              </h5>
              <div
                className="bg-muted p-3 rounded-lg text-sm text-foreground"
                data-testid="text-right-hand"
              >
                {item.rightHand.map((position, index) => (
                  <div key={index}>{position}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
