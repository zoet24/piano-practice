import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CHORDS, getChordNotes, type Chord } from "@/data/chords";
import { useState } from "react";
import { useNoteMode } from "../../contexts/NoteModeContext";
import { generateInversions } from "../../hooks/generateInversions";
import { PianoKeys } from "../piano/PianoKeys";
import { Badge } from "../ui/badge";
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

  const { mode } = useNoteMode();

  const inversions = generateInversions(rootChord);
  const allChords = [rootChord, ...inversions];

  const [selectedChordName, setSelectedChordName] = useState(rootChord.name);
  const selectedChord =
    allChords.find((ch) => ch.name === selectedChordName) ?? rootChord;
  const selectedChordNotes = getChordNotes(selectedChord, mode);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="modal-chord-details"
      >
        <DialogHeader>
          <div className="flex flex-col items-center gap-2">
            <DialogTitle
              className="text-2xl font-bold"
              data-testid="text-chord-name"
            >
              {selectedChord.fullName}:
            </DialogTitle>
            <div className="flex gap-2">
              {selectedChordNotes.map((note, index) => (
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
          </div>
        </DialogHeader>

        <Tabs
          defaultValue={rootChord.name}
          onValueChange={(val) => setSelectedChordName(val)}
        >
          <div className="flex">
            <TabsList className="w-full">
              {allChords.map((ch) => (
                <TabsTrigger key={ch.name} value={ch.name}>
                  {ch.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

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
                <Tabs defaultValue="both">
                  <TabsList className="flex w-full">
                    <TabsTrigger value="left">Left Hand</TabsTrigger>
                    <TabsTrigger value="both">Both Hands</TabsTrigger>
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
              </TabsContent>
            );
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
