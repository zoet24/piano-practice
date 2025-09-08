import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CHORDS, type Chord } from "@/data/chords";
import { generateInversions } from "../../hooks/generateInversions";
import { PianoKeys } from "../piano/PianoKeys";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface ChordModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  type: "chord" | "scale";
}

export interface KeyAnnotation {
  keyIndex: number; // e.g. 0 = C, 4 = E, 7 = G
  label: string; // e.g. "LH 5" or "RH 1"
}

export function ChordModal({ isOpen, onClose, itemId, type }: ChordModalProps) {
  if (!itemId) return null;

  const rootChord: Chord = CHORDS[itemId];
  if (!rootChord) return null;

  const inversions = generateInversions(rootChord);
  const allChords = [rootChord, ...inversions];

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
            {rootChord.fullName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={rootChord.name} className="pt-4">
          <TabsList className="flex flex-wrap">
            {allChords.map((ch) => (
              <TabsTrigger key={ch.name} value={ch.name}>
                {ch.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {allChords.map((ch) => {
            const lhAnnotations = ch.pianoKeys.map((k, i) => ({
              keyIndex: k,
              label: `LH ${ch.leftHand?.[i] ?? ""}`,
            }));
            const rhAnnotations = ch.pianoKeys.map((k, i) => ({
              keyIndex: k + 12,
              label: `RH ${ch.rightHand?.[i] ?? ""}`,
            }));

            return (
              <TabsContent key={ch.name} value={ch.name}>
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-foreground">
                    Notes
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {ch.notes.map((note, index) => (
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

                  {/* Hand view toggle */}
                  <Tabs defaultValue="both" className="pt-2 mb-4">
                    <TabsList className="flex w-full">
                      <TabsTrigger value="both">Both Hands</TabsTrigger>
                      <TabsTrigger value="left">Left Hand</TabsTrigger>
                      <TabsTrigger value="right">Right Hand</TabsTrigger>
                    </TabsList>

                    <TabsContent value="both">
                      <PianoKeys
                        annotations={[...lhAnnotations, ...rhAnnotations]}
                        octaves={3}
                      />
                    </TabsContent>
                    <TabsContent value="left">
                      <PianoKeys annotations={lhAnnotations} octaves={3} />
                    </TabsContent>
                    <TabsContent value="right">
                      <PianoKeys annotations={rhAnnotations} octaves={3} />
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
